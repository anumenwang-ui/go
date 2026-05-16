import { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AppDataProvider } from "./hooks/useAppData";
import { ToastProvider } from "./hooks/useToast";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PageEffect } from "./components/PageEffect";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Tasks } from "./pages/Tasks";
import { Ritual } from "./pages/Ritual";
import { Media } from "./pages/Media";
import { Members } from "./pages/Members";
import { Review } from "./pages/Review";
import { initStorage } from "./data/storage";

function Page({ children }: { children: React.ReactNode }) {
  return <PageEffect>{children}</PageEffect>;
}

export default function App() {
  useEffect(() => {
    initStorage();
  }, []);
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppDataProvider>
          <HashRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Page><Dashboard /></Page>} />
                <Route path="/tasks" element={<Page><Tasks /></Page>} />
                <Route path="/ritual" element={<Page><Ritual /></Page>} />
                <Route path="/media" element={<Page><Media /></Page>} />
                <Route path="/members" element={<Page><Members /></Page>} />
                <Route path="/review" element={<Page><Review /></Page>} />
              </Routes>
            </Layout>
          </HashRouter>
        </AppDataProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
