import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Layout } from './components/Layout';
import { Toaster } from './components/Toaster';
import { pageVariants } from './lib/motion';

export default function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <Layout>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
      <Toaster />
    </Layout>
  );
}
