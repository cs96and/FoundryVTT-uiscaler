/*
 * UI Scaler
 * https://github.com/cs96and/FoundryVTT-uiscaler
 *
 * Copyright (c) 2023 Alan Davies - All Rights Reserved.
 *
 * You may use, distribute and modify this code under the terms of the MIT license.
 *
 * You should have received a copy of the MIT license with this file. If not, please visit:
 * https://mit-license.org/
 */

Hooks.once("setup", () => {

	function _updateScale(scale) {
		const floatScale = (scale ?? game.settings.get("uiscaler", "scale")) / 100;
		const rootStyle = document.querySelector(':root').style;
		rootStyle.setProperty("--uiscaler-scale", floatScale);
	}

	game.settings.register("uiscaler", "scale", {
		name: game.i18n.localize("uiscaler.scale.name"),
		hint: game.i18n.localize("uiscaler.scale.hint"),
		scope: 'client',
		config: true,
		type: Number,
		range: {
			min: 10,
			max: 200,
			step: 1
		},
		default: 100
	});

	Hooks.on("renderSettingsConfig", (app, html, user) => {
		// Update the UI in realtime if the user drags the slider
		const input = html[0].querySelector('input[name="uiscaler.scale"]');
		input.addEventListener("change", () => {
			_updateScale(input.value);
		});
	});

	// Not required if settings are saved, but resets the UI scale if the settings are closed without saving.
	Hooks.on("closeSettingsConfig", () => _updateScale());

	// Set the scale on startup
	_updateScale();

});
