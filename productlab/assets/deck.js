(function () {
  const charts = new Map();
  const tick = "#6b6b85";
  const grid = "rgba(42,42,122,.08)";

  function buildChart(canvas) {
    if (!window.Chart || charts.has(canvas)) return;
    const raw = canvas.getAttribute("data-chart");
    if (!raw) return;
    const cfg = JSON.parse(raw);
    const type = cfg.type || "bar";
    const base = {
      responsive: true,
      maintainAspectRatio: false,
      color: tick,
      plugins: {
        legend: {
          display: cfg.legend !== false,
          labels: { boxWidth: 12, color: tick },
        },
        title: { display: false },
      },
    };
    const options = Object.assign(base, cfg.options || {});
    if ((type === "bar" || type === "line") && !cfg.options?.scales) {
      options.scales = {
        x: { grid: { display: false }, ticks: { color: tick } },
        y: {
          beginAtZero: true,
          grid: { color: grid },
          ticks: { color: tick },
        },
      };
    } else if (options.scales) {
      ["x", "y", "r"].forEach((axis) => {
        if (!options.scales[axis]) return;
        options.scales[axis].ticks = Object.assign(
          { color: tick },
          options.scales[axis].ticks || {}
        );
        if (options.scales[axis].grid) {
          options.scales[axis].grid.color =
            options.scales[axis].grid.color || grid;
        }
        if (options.scales[axis].title) {
          options.scales[axis].title.color = tick;
        }
      });
    }
    charts.set(
      canvas,
      new Chart(canvas.getContext("2d"), {
        type,
        data: cfg.data,
        options,
      })
    );
  }

  document.querySelectorAll("canvas[data-chart]").forEach(buildChart);
})();
