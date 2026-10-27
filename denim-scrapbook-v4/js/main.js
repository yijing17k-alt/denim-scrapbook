/* Boot: apply settings, add shared SVG definitions, build the notebook. */
(function () {
  const UI = window.UI;
  UI.applySettings();
  document.getElementById('svg-defs').innerHTML = ART.defs;
  UI.notebook.start(document.getElementById('app'));
})();
