/* '/' → Home. Everything else unknown falls through to core's 404 card. */
(function () {
  DM.page('/', { render: () => { setTimeout(() => DM.go('/dashboard'), 0); return ''; } });
})();
