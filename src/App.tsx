import { Routes, Route } from "react-router-dom";
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
      <About />
      <Education />
      <Experience />
      <Resume />
      <Projects />
    </main>
  );
}

function App() {
  return (
    <>
      <div className="bg-glow" aria-hidden="true" />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reflect" element={<ReflectPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
