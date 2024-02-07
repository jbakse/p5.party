export function insetRect(r, inset) {
  return {
    top: r.top + inset,
    left: r.left + inset,
    width: r.width - inset * 2,
    height: r.height - inset * 2,
  };
}
