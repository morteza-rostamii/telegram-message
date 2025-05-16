export function printRoutes(app) {
  if (!app._router) {
    console.warn("No routes found. Did you register any routes?");
    return;
  }

  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Direct route
      const methods = Object.keys(middleware.route.methods)
        .map((m) => m.toUpperCase())
        .join(", ");
      console.log(`${methods} ${middleware.route.path}`);
    } else if (middleware.name === "router") {
      // Router middleware
      middleware.handle.stack.forEach((handler) => {
        const route = handler.route;
        if (route) {
          const methods = Object.keys(route.methods)
            .map((m) => m.toUpperCase())
            .join(", ");
          console.log(`${methods} ${route.path}`);
        }
      });
    }
  });
}
