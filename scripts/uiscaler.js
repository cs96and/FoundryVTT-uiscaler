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

	const rootStyle = document.querySelector(':root').style;

	function _updateUiScale(scale) {
		const floatScale = (scale ?? game.settings.get("uiscaler", "ui-scale")) / 100;
		rootStyle.setProperty("--uiscaler-ui-scale", floatScale);
	}

	function _updateWindowScale(scale) {
		const floatScale = (scale ?? game.settings.get("uiscaler", "window-scale")) / 100;
		rootStyle.setProperty("--uiscaler-window-scale", floatScale);
	}

	function _updateScales() {
		_updateUiScale();
		_updateWindowScale();
	}

	game.settings.register("uiscaler", "ui-scale", {
		name: game.i18n.localize("uiscaler.ui-scale.name"),
		hint: game.i18n.localize("uiscaler.ui-scale.hint"),
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

	game.settings.register("uiscaler", "window-scale", {
		name: game.i18n.localize("uiscaler.window-scale.name"),
		hint: game.i18n.localize("uiscaler.window-scale.hint"),
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
		const uiInput = html[0].querySelector('input[name="uiscaler.ui-scale"]');
		uiInput.addEventListener("change", (...args) => {
			_updateUiScale(uiInput.value);
		});

		const windowInput = html[0].querySelector('input[name="uiscaler.window-scale"]');
		windowInput.addEventListener("change", (...args) => {
			_updateWindowScale(windowInput.value);
		});
	});

	// Not required if settings are saved, but resets the UI scale if the settings are closed without saving.
	Hooks.on("closeSettingsConfig", () => _updateScales());

	// Set the scales on startup
	Hooks.once("ready", () => _updateScales());
});
