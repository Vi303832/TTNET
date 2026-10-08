const firebaseService = require('../services/firebaseService');
const { calculateCost, getModelsCatalog } = require('../utils/pricing');

/**
 * Controller for Token & Cost Analytics and Estimation
 */
class CostController {
  /**
   * Get overall cost statistics and trends for current user
   * GET /api/cost/stats
   */
  async getStats(req, res, next) {
    try {
      const userId = req.user?.uid || 'dev-user-123';
      const stats = await firebaseService.getUserStats(userId);
      res.status(200).json({
        success: true,
        stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Estimate token cost before sending
   * POST /api/cost/estimate
   */
  async estimateCost(req, res, next) {
    try {
      const { model = 'gemini-1.5-flash', promptTokens = 0, candidateTokens = 0, text, exchangeRate } = req.body;

      let estimatedPromptTokens = Number(promptTokens) || 0;
      if (text && !estimatedPromptTokens) {
        // Heuristic estimate: ~3.5 chars per token
        estimatedPromptTokens = Math.max(1, Math.ceil(text.length / 3.5));
      }

      const estimatedCandidateTokens = Number(candidateTokens) || 0;
      const calculation = calculateCost(model, estimatedPromptTokens, estimatedCandidateTokens, exchangeRate);

      res.status(200).json({
        success: true,
        calculation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pricing catalogue of all models
   * GET /api/cost/pricing
   */
  async getPricing(req, res, next) {
    try {
      const catalog = getModelsCatalog();
      res.status(200).json({
        success: true,
        models: catalog
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CostController();
