const geminiService = require('../services/geminiService');
const firebaseService = require('../services/firebaseService');

/**
 * Chat Controller for Gemini Streaming & History Management
 */
class ChatController {
  /**
   * SSE (Server-Sent Events) Streaming Chat Endpoint
   * POST /api/chat/stream
   */
  async streamChat(req, res) {
    const {
      prompt,
      model = 'gemini-1.5-flash',
      systemInstruction,
      history = [],
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      generationConfig = {},
      exchangeRate
    } = req.body;

    const userId = req.user?.uid || 'dev-user-123';

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Geçerli bir sohbet mesajı (prompt) gereklidir.'
      });
    }

    // Set Server-Sent Events headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    // Helper to send SSE packets
    const sendSSE = (event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
      // 1. Save user prompt to database
      await firebaseService.saveMessage(userId, sessionId, {
        role: 'user',
        content: prompt.trim()
      });

      // 2. Stream AI response
      const result = await geminiService.streamChat({
        prompt: prompt.trim(),
        model,
        systemInstruction,
        history,
        generationConfig,
        exchangeRate,
        onChunk: (chunkText) => {
          sendSSE('chunk', { text: chunkText });
        }
      });

      // 3. Save assistant response and cost record
      const savedAssistantMsg = await firebaseService.saveMessage(userId, sessionId, {
        role: 'model',
        content: result.content,
        model: result.model,
        tokens: result.tokens,
        cost: {
          totalCostUSD: result.costUSD.totalCost,
          totalCostTRY: result.costTRY.totalCost
        },
        latencyMs: result.latencyMs
      });

      // 4. Record token & cost transaction for analytics
      await firebaseService.recordUsage(userId, {
        sessionId,
        model: result.model,
        tokens: result.tokens,
        costUSD: result.costUSD,
        costTRY: result.costTRY,
        latencyMs: result.latencyMs
      });

      // 5. Send completion event with full stats
      sendSSE('done', {
        sessionId,
        messageId: savedAssistantMsg.id,
        content: result.content,
        model: result.model,
        tokens: result.tokens,
        costUSD: result.costUSD,
        costTRY: result.costTRY,
        latencyMs: result.latencyMs
      });

      res.end();
    } catch (error) {
      console.error('Gemini Stream Error:', error);
      sendSSE('error', {
        error: error.message || 'Gemini API ile iletişim kurulurken bir hata oluştu.',
        sessionId
      });
      res.end();
    }
  }

  /**
   * Non-streaming Chat Endpoint
   * POST /api/chat/message
   */
  async sendMessage(req, res, next) {
    try {
      const {
        prompt,
        model = 'gemini-1.5-flash',
        systemInstruction,
        history = [],
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        generationConfig = {},
        exchangeRate
      } = req.body;

      const userId = req.user?.uid || 'dev-user-123';

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Geçerli bir sohbet mesajı (prompt) gereklidir.'
        });
      }

      // Save user message
      await firebaseService.saveMessage(userId, sessionId, {
        role: 'user',
        content: prompt.trim()
      });

      const result = await geminiService.generateChat({
        prompt: prompt.trim(),
        model,
        systemInstruction,
        history,
        generationConfig,
        exchangeRate
      });

      // Save assistant message
      const savedAssistantMsg = await firebaseService.saveMessage(userId, sessionId, {
        role: 'model',
        content: result.content,
        model: result.model,
        tokens: result.tokens,
        cost: {
          totalCostUSD: result.costUSD.totalCost,
          totalCostTRY: result.costTRY.totalCost
        },
        latencyMs: result.latencyMs
      });

      // Record token & cost transaction
      await firebaseService.recordUsage(userId, {
        sessionId,
        model: result.model,
        tokens: result.tokens,
        costUSD: result.costUSD,
        costTRY: result.costTRY,
        latencyMs: result.latencyMs
      });

      return res.status(200).json({
        success: true,
        sessionId,
        message: savedAssistantMsg,
        tokens: result.tokens,
        costUSD: result.costUSD,
        costTRY: result.costTRY,
        latencyMs: result.latencyMs
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all sessions of current user
   * GET /api/chat/sessions
   */
  async getSessions(req, res, next) {
    try {
      const userId = req.user?.uid || 'dev-user-123';
      const sessions = await firebaseService.getUserSessions(userId);
      res.status(200).json({
        success: true,
        sessions
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get messages for a session
   * GET /api/chat/sessions/:sessionId/messages
   */
  async getSessionMessages(req, res, next) {
    try {
      const userId = req.user?.uid || 'dev-user-123';
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({ success: false, error: 'Oturum kimliği (sessionId) gereklidir.' });
      }

      const messages = await firebaseService.getSessionMessages(userId, sessionId);
      res.status(200).json({
        success: true,
        sessionId,
        messages
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a session
   * DELETE /api/chat/sessions/:sessionId
   */
  async deleteSession(req, res, next) {
    try {
      const userId = req.user?.uid || 'dev-user-123';
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({ success: false, error: 'Oturum kimliği (sessionId) gereklidir.' });
      }

      await firebaseService.deleteSession(userId, sessionId);
      res.status(200).json({
        success: true,
        message: 'Oturum başarıyla silindi.'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChatController();
