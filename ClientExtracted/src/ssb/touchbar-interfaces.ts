/**
 * This whole defenition class will become useless as soon as Electron's new
 * type defenitions become available.
 *
 * @module SSBIntegration
 */ /** for typedoc */

export interface ITouchBarButton {
  new (options: ITouchBarButtonOptions): ITouchBarButtonInstance;
}

export interface ITouchBarButtonInstance {
  label: string;
  icon: Electron.NativeImage;
  backgroundColor: string;
}

export interface ITouchBarButtonOptions {
  label?: string;
  backgroundColor?: string;
  icon?: Electron.NativeImage;
  click?: Function;
}

export interface ITouchBarColorPicker {
  new (options: ITouchBarColorPickerOptions): ITouchBarColorPickerInstance;
}

export interface ITouchBarColorPickerInstance {
  availableColors: Array<string>;
  selectedColor: string;
}

export interface ITouchBarColorPickerOptions {
  availableColors?: Array<string>;
  selectedColor?: string;
  change?: (selectedColor: string) => void;
}

export interface ITouchBarGroup {
  new (options: ITouchBarGroupOptions): ITouchBarGroupInstance;
}

export interface ITouchBarGroupInstance { } //tslint:disable-line:no-empty-interface

export interface ITouchBarGroupOptions {
  items: Array<ITouchBarButton | ITouchBarColorPicker | ITouchBarLabel | ITouchBarPopover | ITouchBarSlider | ITouchBarSpacer>;
}

export interface ITouchBarLabel {
  new (options: ITouchBarLabelOptions): ITouchBarLabelInstance;
}

export interface ITouchBarLabelInstance {
  label: string;
  textColor: string;
}

export interface ITouchBarLabelOptions {
  label?: string;
  textColor?: string;
}

export interface ITouchBarPopover {
  new (options: ITouchBarPopoverOptions): ITouchBarPopoverInstance;
}

export interface ITouchBarPopoverInstance {
  label: string;
  icon: Electron.NativeImage;
}

export interface ITouchBarPopoverOptions {
  label?: string;
  icon?: Electron.NativeImage;
  items?: Array<ITouchBarButton | ITouchBarColorPicker | ITouchBarLabel | ITouchBarPopover | ITouchBarSlider | ITouchBarSpacer>;
  showCloseButton?: boolean;
}

export interface ITouchBarSlider {
  new (options: ITouchBarSliderOptions): ITouchBarSliderInstance;
}

export interface ITouchBarSliderInstance {
  label: string;
  value: number;
  maxValue: number;
  minValue: number;
}

export interface ITouchBarSliderOptions {
  label?: string;
  value?: number;
  maxValue?: number;
  minValue?: number;
  change: (newValue: number) => void;
}

export interface ITouchBarSpacer {
  new (options: ITouchBarSpacerOptions): ITouchBarSpacerInstance;
}

export interface ITouchBarSpacerInstance { } //tslint:disable-line:no-empty-interface

export interface ITouchBarSpacerOptions {
  size: 'small' | 'large' | 'flexible';
}
