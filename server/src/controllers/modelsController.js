const { getModelsCatalog } = require('../utils/pricing');

/**
 * Controller for Gemini Models catalogue
 */
class ModelsController {
  /**
   * Get all supported Gemini models with features, token limits, and pricing
   * GET /api/models
   */
  async getModels(req, res, next) {
    try {
      const models = getModelsCatalog();
      res.status(200).json({
        success: true,
        models,
        defaultModel: 'gemini-1.5-flash'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ModelsController();
