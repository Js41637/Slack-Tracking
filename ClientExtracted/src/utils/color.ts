import * as Kolor from 'color';
import ThemeMock from '../mocks/theme-mock';

export interface RGBColor {
    r: number;
    g: number;
    b: number;
    a?: number;
}

export interface FullRGBColor {
    red: number;
    green: number;
    blue: number;
    alpha?: number;
}

export interface HSLColor {
    h: number;
    s: number;
    l: number;
    a?: number;
}

export interface FullHSLColor {
    hue: number;
    saturation: number;
    lightness: number;
    alpha?: number;
}

export interface HSVColor {
    h: number;
    s: number;
    v: number;
}

export interface FullHSVColor {
    hue: number;
    saturation: number;
    value: number;
}

export interface HBWColor {
    h: number;
    b: number;
    w: number;
}

export interface FullHBWColor {
    hue: number;
    whiteness: number;
    blackness: number;
}

export interface CMYKColor {
    c: number;
    m: number;
    y: number;
    k: number;
}

export interface FullCMYKColor {
    cyan: number;
    magenta: number;
    yellow: number;
    black: number;
}

export type ColorParam = string | RGBColor | FullRGBColor | HSLColor | FullHSLColor | HSVColor
    | FullHSVColor | HBWColor | FullHBWColor | CMYKColor | FullCMYKColor

export interface Color {
    (color: ColorParam | Color) : Color;
    rgb(values: Array<number>): Color;
    rgb(r: number, g: number, b: number, a?: number): Color;
    rgb(values: RGBColor): Color;
    rgb(values: FullRGBColor): Color;
    rgb(): RGBColor;
    rgbArray(): Array<number>;
    rgbString(): string;
    rgbaString(): string;
    rgbNumber(): number;
    hsl(values: Array<number>): Color;
    hsl(): HSLColor;
    hslArray(): Array<number>;
    hslString(): string;
    hslaString(): string;
    hsv(values: Array<number>): Color;
    hsv(): HSVColor;
    hsvArray(): Array<number>;
    hsvString(): string;
    hbw(values: Array<number>): Color;
    hbw(): HBWColor;
    hbwArray(): Array<number>;
    hbwString(): string;
    cmyk(values: Array<number>): Color;
    cmyk(): CMYKColor;
    cmykArray(): Array<number>;
    cmykString(): string;
    hexString(): string;
    percentString(): string;
    keyword(): string | void;
    alpha(alpha: number): Color;
    alpha(): number;
    red(red: number): Color;
    red(): number;
    green(green: number): Color;
    green(): number;
    blue(blue: number): Color;
    blue(): number;
    hue(hue: number): Color;
    hue(): number;
    saturation(saturation: number): Color;
    saturation(): number;
    lightness(lightness: number): Color;
    lightness(): number;
    saturationv(saturationv: number): Color;
    saturationv(): number;
    value(value: number): Color;
    value(): number;
    whiteness(whiteness: number): Color;
    whiteness(): number;
    blackness(blackness: number): Color;
    blackness(): number;
    cyan(cyan: number): Color;
    cyan(): number;
    magenta(magenta: number): Color;
    magenta(): number;
    yellow(yellow: number): Color;
    yellow(): number;
    black(black: number): Color;
    black(): number;
    luminosity(): number;
    contrast(color: Color): number;
    dark(): boolean;
    light(): boolean;
    negate(): Color;
    lighten(value: number): Color;
    darken(value: number): Color;
    saturate(value: number): Color;
    desaturate(value: number): Color;
    greyscale(): Color;
    whiten(value: number): Color;
    blacken(value: number): Color;
    clearer(value: number): Color;
    opaquer(value: number): Color;
    rotate(value: number): Color;
    mix(color: Color, value?: number): Color;
    level(color: Color): string;
    clone(): Color;
}

/**
 * Returns a suitable sidebar color as a hex string.
 */
export function getSidebarColor(team: any): string {
  return getSidebarColorForTeam(team).rgbString();
}

/**
 * Returns the color that will be most visible against the sidebar color for
 * the given team.
 *
 * @param  {Object} team The team
 * @return {String}      Black or white, as a hex string
 */
export function getTextColor(team: any): string {
  const sidebarColor = getSidebarColorForTeam(team);

  return sidebarColor.light() ?
    '#000000' :
    '#FFFFFF';
}

/**
 * Returns a suitable sidebar color for the team, given its theme.
 *
 * @param  {Object} team  The team
 * @return {Color}        A `Color` instance
 */
function getSidebarColorForTeam(team: any): Color {
  const theme = team && team.theme ?
    team.theme :
    ThemeMock.get();

  const column = Kolor(theme.column_bg);

  // NB: Light themes, such as Hoth, look better this way
  if (column.light()) {
    return column.darken(0.10).desaturate(0.10);
  } else {
    return column.darken(0.5);
  }
}
