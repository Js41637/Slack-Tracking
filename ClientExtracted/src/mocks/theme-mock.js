import Mock from '../lib/mock';

class ThemeMock extends Mock {
  base = {
    active_item: "#D39B46",
    active_item_text: "#FFFFFF",
    active_presence: "#99D04A",
    badge: "#DB6668",
    column_bg: "#4D5250",
    hover_item: "#434745",
    menu_bg: "#444A47",
    text_color: "#FFFFFF"
  };

  aubergine = {
    active_item: "#4C9689",
    active_item_text: "#FFFFFF",
    active_presence: "#38978D",
    badge: "#EB4D5C",
    column_bg: "#4D394B",
    hover_item: "#3E313C",
    menu_bg: "#3E313C",
    text_color: "#FFFFFF"
  };

  hoth = {
    active_item: "#CAD1D9",
    active_item_text: "#FFFFFF",
    active_presence: "#60D156",
    badge: "#FF8669",
    column_bg: "#F8F8FA",
    hover_item: "#FFFFFF",
    menu_bg: "#F8F8FA",
    text_color: "#383F45"
  };

  monument = {
    active_item: "#F79F66",
    active_item_text: "#FFFFFF",
    active_presence: "#F79F66",
    badge: "#F15340",
    column_bg: "#0D7E83",
    hover_item: "#D37C71",
    menu_bg: "#076570",
    text_color: "#FFFFFF"
  };
}

export default new ThemeMock();
