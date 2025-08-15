import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { performCalculationInputSchema } from './schema';

// Import handlers
import { performCalculation } from './handlers/perform_calculation';
import { getCalculationHistory } from './handlers/get_calculation_history';
import { clearCalculationHistory } from './handlers/clear_calculation_history';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Perform a calculation (add, subtract, multiply, divide)
  performCalculation: publicProcedure
    .input(performCalculationInputSchema)
    .mutation(({ input }) => performCalculation(input)),
  
  // Get calculation history for kids to review their work
  getCalculationHistory: publicProcedure
    .query(() => getCalculationHistory()),
  
  // Clear calculation history to give kids a fresh start
  clearCalculationHistory: publicProcedure
    .mutation(() => clearCalculationHistory()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`Kids Calculator TRPC server listening at port: ${port}`);
}

start();