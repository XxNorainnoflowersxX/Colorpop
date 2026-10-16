// Image fallback constants and handler
export const FALLBACK_HERO = '/colorpop_hero.jpg';
export const FALLBACK_AVATAR = '/lucious.jpg';
export const FALLBACK_SCENE = '/penthouse.jpg';
export const FALLBACK_MANSION = '/mansion.jpg';
export const FALLBACK_ROADTRIP = '/roadtrip.jpg';

export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback: string = FALLBACK_HERO
) => {
  const target = e.currentTarget;
  if (target.src !== fallback && !target.src.endsWith(fallback)) {
    target.src = fallback;
  }
};
