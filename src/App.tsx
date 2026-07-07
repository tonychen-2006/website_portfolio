import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Education from "./components/Education";
import Projects from "./components/Projects";
import Resume from "./components/Resume";
import Footer from "./components/Footer";
import ReflectPage from "./pages/Reflect";
import "./index.css";

function Home() {
  return (
    <main className="main-content">
      <Hero />
      <Experience />
      <Resume />
      <Education />
      <Projects />
      <About />
    </main>
  );
}

function ScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const frame = requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    });

    return () => cancelAnimationFrame(frame);
  }, [hash]);

  return null;
}

function App() {
  return (
    <>
      <div className="bg-glow" aria-hidden="true" />
      <Header />
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reflect" element={<ReflectPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
