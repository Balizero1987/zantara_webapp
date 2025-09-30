/**
 * Simple SPA Router
 *
 * Handles client-side routing without full page reloads.
 */

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.beforeHooks = [];
    this.afterHooks = [];

    // Listen to popstate (back/forward)
    window.addEventListener('popstate', (e) => {
      this.navigate(window.location.pathname, false);
    });
  }

  /**
   * Register a route
   */
  register(path, handler) {
    this.routes.set(path, handler);
  }

  /**
   * Register multiple routes
   */
  registerRoutes(routes) {
    Object.entries(routes).forEach(([path, handler]) => {
      this.register(path, handler);
    });
  }

  /**
   * Navigate to a route
   */
  async navigate(path, pushState = true) {
    // Run before hooks
    for (const hook of this.beforeHooks) {
      const result = await hook(path, this.currentRoute);
      if (result === false) {
        return; // Navigation cancelled
      }
    }

    // Find matching route
    const handler = this.routes.get(path);
    if (!handler) {
      console.warn(`No route found for: ${path}`);
      return;
    }

    // Update browser history
    if (pushState) {
      window.history.pushState({ path }, '', path);
    }

    // Execute route handler
    try {
      await handler(path);
      this.currentRoute = path;

      // Run after hooks
      for (const hook of this.afterHooks) {
        await hook(path);
      }
    } catch (error) {
      console.error('Route handler error:', error);
    }
  }

  /**
   * Add before navigation hook
   */
  beforeEach(hook) {
    this.beforeHooks.push(hook);
  }

  /**
   * Add after navigation hook
   */
  afterEach(hook) {
    this.afterHooks.push(hook);
  }

  /**
   * Go back
   */
  back() {
    window.history.back();
  }

  /**
   * Go forward
   */
  forward() {
    window.history.forward();
  }

  /**
   * Replace current route
   */
  replace(path) {
    window.history.replaceState({ path }, '', path);
    this.navigate(path, false);
  }
}

// Export singleton instance
export const router = new Router();
export default router;