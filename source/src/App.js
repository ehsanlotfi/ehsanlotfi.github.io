import { BrowserRouter as Router, Link } from "react-router-dom";

function App()
{

  const cats = [
    {
      "title": "Front-end",
      "path": "front-end"
    },
    {
      "title": "Back-end",
      "path": "back-end"
    },
    {
      "title": "Android / IOS",
      "path": "android-ios"
    },
    {
      "title": "DevOps",
      "path": "devops"
    },
    {
      "title": "Quality Assurance Engineer",
      "path": "quality-assurance-engineer"
    },
    {
      "title": "UI/UX",
      "path": "ui-ux"
    },
    {
      "title": "AI / Machine Learning",
      "path": "ai-machine-learning"
    },
    {
      "title": "Game Developer",
      "path": "game-developer"
    },
    {
      "title": "Embedded Systems Developer",
      "path": "embedded-systems-developer"
    },
    {
      "title": "Cloud Engineer",
      "path": "cloud-engineer"
    },
    {
      "title": "Database Administrator (DBA)",
      "path": "database-administrator"
    },
    {
      "title": "Blockchain Developer",
      "path": "blockchain-developer"
    },
    {
      "title": "AR/VR Developer",
      "path": "ar-vr-developer"
    }
  ];

  return (
    <div className="App">
      <h1 className="mt-5 pt-5 text-white">Developer Tree Map</h1>
      <p className="h3 mt-5 text-secondary">
        Our website offers community-driven treemaps for frontend, backend, DevOps, and more, helping developers choose the right learning path. Explore structured guides and advance your skills efficiently!
      </p>
      <div className="row cats-container mt-5">
        {cats.map((item, index) =>
        {
          return (
            <div className="col-md-4 col-sm-12 mb-3" key={index} >
              <Link className="p-4 d-block border border-secondary  rounded-1 text-decoration-none text-white-50" to={`/tree/${item.path}`}>{item.title}</Link>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default App;
