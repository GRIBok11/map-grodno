export default function MapControls({ points, map }) {
  if (!map) return null;

  const handleCenterMap = () => {
    map.setView([53.7, 23.8], 8);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        background: "white",
        padding: "10px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      <h4>Управление</h4>
      <button onClick={handleCenterMap}>Центрировать</button>
      <p>Загружено точек: {points.length}</p>
    </div>
  );
}
