/*
 * UI Scaler
 * https://github.com/cs96and/FoundryVTT-uiscaler
 *
 * Copyright (c) 2023-2025 Alan Davies - All Rights Reserved.
 *
 * You may use, distribute and modify this code under the terms of the MIT license.
 *
 * You should have received a copy of the MIT license with this file. If not, please visit:
 * https://mit-license.org/
 */

Hooks.once("setup", () => {

	const root = document.querySelector(':root');

	if (game.release.generation < 13) {
		root.classList.add("uiscaler-v12");
	}

	function _updateUiScale(scale) {
		if (game.release.generation < 13) {
			const floatScale = (scale ?? game.settings.get("uiscaler", "ui-scale")) / 100;
			root.style.setProperty("--uiscaler-ui-scale", floatScale);
		}
	}

	function _updateWindowScale(scale) {
		const options = {
			scale: (scale ?? game.settings.get("uiscaler", "window-scale")) / 100
		};

		// Loop through all the v2 windows (apart from the settings window) and update their scale
		if (game.release.generation >= 12) {
			for (const [_, app] of foundry.applications.instances) {
				if (app.hasFrame && !(app instanceof SettingsConfig)) {
					app.setPosition(options);
				}
			}
		}

		// Loop through all open windows (apart from the settings window) and re-render them with the updated scale
		for (const window of Object.values(ui.windows)) {
			if (!(window instanceof SettingsConfig)) {
				window.render(false, options);
			}
		}
	}

	function _updateScales() {
		_updateUiScale();
		_updateWindowScale();
	}

	if (game.release.generation < 13) {
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
	}

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
		// Update the UI in realtime if the user drags either slider
		const element = game.release.generation >= 13 ? html : html[0];
		const rangePicker = game.release.generation >= 13 ? 'range-picker' : 'input';

		if (game.release.generation < 13) {
			const uiInput = element.querySelector(`${rangePicker}[name="uiscaler.ui-scale"]`);
			uiInput.addEventListener("change", (...args) => {
				_updateUiScale(uiInput.value);
			});
		}

		const windowInput = element.querySelector(`${rangePicker}[name="uiscaler.window-scale"]`);
		windowInput.addEventListener("change", (...args) => {
			_updateWindowScale(windowInput.value);
		});
	});

	// Not required if settings are saved, but resets the UI scale if the settings are closed without saving.
	Hooks.on("closeSettingsConfig", () => _updateScales());

	// Override window rendering to apply the chosen window scale
	libWrapper.register('uiscaler', 'Application.prototype.render', (wrapped, force = false, options = {}) => {
		options.scale ??= game.settings.get("uiscaler", "window-scale") / 100;
		return wrapped(force, options);
	}, "WRAPPER");

	// Override ApplicationV2 rendering to apply the chosen window scale
	Hooks.on("renderApplicationV2", (app, html) => {
		const options = {
			scale: game.settings.get("uiscaler", "window-scale") / 100
		};
		app.setPosition(options);
	});
	
	// Set the scales on startup
	_updateScales();
});

Hooks.once("ready", async () => {
	if (!game.modules.get('lib-wrapper')?.active && game.user.isGM)
		ui.notifications.error("UI Scaler requires the 'libWrapper' module. Please install and activate it.", { permanent: true });
});
