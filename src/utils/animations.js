import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Fade In Animation
 * Perfect for content appearing on scroll
 */
export const fadeIn = (element, options = {}) => {
  const defaults = { duration: 0.8, delay: 0, ease: "power2.out" };
  const config = { ...defaults, ...options };
  
  return gsap.fromTo(
    element,
    { opacity: 0 },
    { opacity: 1, ...config }
  );
};

/**
 * Slide Up Animation
 * Perfect for content sliding in from bottom
 */
export const slideUp = (element, options = {}) => {
  const defaults = { duration: 0.8, delay: 0, ease: "power2.out", distance: 30 };
  const { distance, ...config } = { ...defaults, ...options };
  
  return gsap.fromTo(
    element,
    { opacity: 0, y: distance },
    { opacity: 1, y: 0, ...config }
  );
};

/**
 * Slide In From Left
 */
export const slideInLeft = (element, options = {}) => {
  const defaults = { duration: 0.8, delay: 0, ease: "power2.out", distance: 50 };
  const { distance, ...config } = { ...defaults, ...options };
  
  return gsap.fromTo(
    element,
    { opacity: 0, x: -distance },
    { opacity: 1, x: 0, ...config }
  );
};

/**
 * Slide In From Right
 */
export const slideInRight = (element, options = {}) => {
  const defaults = { duration: 0.8, delay: 0, ease: "power2.out", distance: 50 };
  const { distance, ...config } = { ...defaults, ...options };
  
  return gsap.fromTo(
    element,
    { opacity: 0, x: distance },
    { opacity: 1, x: 0, ...config }
  );
};

/**
 * Stagger Children Animation
 * Perfect for lists and grids
 */
export const staggerChildren = (parent, options = {}) => {
  const defaults = {
    each: 0.1,
    duration: 0.6,
    ease: "power2.out",
    delay: 0,
  };
  const config = { ...defaults, ...options };
  const selector = config.selector || "*";
  const children = parent.querySelectorAll(selector);
  
  return gsap.fromTo(
    children,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      stagger: config.each,
      duration: config.duration,
      ease: config.ease,
      delay: config.delay,
    }
  );
};

/**
 * Scroll Reveal Animation
 * Triggers animation when element enters viewport
 */
export const scrollReveal = (element, options = {}) => {
  const defaults = {
    duration: 0.8,
    ease: "power2.out",
    distance: 30,
    type: "fadeUp", // fadeUp, fadeLeft, fadeRight, fade
  };
  const { distance, type, ...config } = { ...defaults, ...options };
  
  let fromVars = { opacity: 0 };
  switch (type) {
    case "fadeUp":
      fromVars = { opacity: 0, y: distance };
      break;
    case "fadeLeft":
      fromVars = { opacity: 0, x: -distance };
      break;
    case "fadeRight":
      fromVars = { opacity: 0, x: distance };
      break;
    case "fade":
      fromVars = { opacity: 0 };
      break;
  }
  
  return gsap.fromTo(element, fromVars, {
    opacity: 1,
    x: 0,
    y: 0,
    scrollTrigger: {
      trigger: element,
      start: "top 80%",
      end: "top 20%",
      toggleActions: "play none none none",
      markers: false,
    },
    ...config,
  });
};

/**
 * Number Counter Animation
 * Perfect for stats and metrics
 */
export const countUpAnimation = (element, targetValue, options = {}) => {
  const defaults = { duration: 2, ease: "power2.out", prefix: "", suffix: "" };
  const config = { ...defaults, ...options };
  
  const obj = { value: 0 };
  
  return gsap.to(obj, {
    value: targetValue,
    duration: config.duration,
    ease: config.ease,
    onUpdate: () => {
      element.textContent =
        config.prefix + Math.floor(obj.value).toLocaleString() + config.suffix;
    },
  });
};

/**
 * Hover Scale Effect
 */
export const hoverScale = (element, options = {}) => {
  const defaults = { scale: 1.05, duration: 0.3, ease: "power2.out" };
  const config = { ...defaults, ...options };
  
  element.addEventListener("mouseenter", () => {
    gsap.to(element, { scale: config.scale, duration: config.duration, ease: config.ease });
  });
  
  element.addEventListener("mouseleave", () => {
    gsap.to(element, { scale: 1, duration: config.duration, ease: config.ease });
  });
};

/**
 * Rotate Animation
 */
export const rotate = (element, options = {}) => {
  const defaults = { duration: 1, ease: "linear", rotation: 360, repeat: -1 };
  const config = { ...defaults, ...options };
  
  return gsap.to(element, config);
};

/**
 * Pulse Animation (breathing effect)
 */
export const pulse = (element, options = {}) => {
  const defaults = { duration: 1.5, ease: "power1.inOut", repeat: -1 };
  const config = { ...defaults, ...options };
  
  return gsap.to(element, {
    ...config,
    opacity: 0.6,
    yoyo: true,
  });
};

/**
 * Shimmer/Loading Skeleton Animation
 */
export const shimmer = (element, options = {}) => {
  const defaults = { duration: 2, ease: "none", repeat: -1 };
  const config = { ...defaults, ...options };
  
  return gsap.to(element, {
    ...config,
    backgroundPosition: "200% center",
  });
};

/**
 * Bounce Animation
 */
export const bounce = (element, options = {}) => {
  const defaults = { duration: 0.6, ease: "power2.out", distance: 20 };
  const { distance, ...config } = { ...defaults, ...options };
  
  return gsap.to(element, {
    y: -distance,
    duration: config.duration / 2,
    ease: config.ease,
    yoyo: true,
    repeat: 1,
  });
};

/**
 * Collapse/Expand Animation
 */
export const toggleCollapse = (element, isOpen, options = {}) => {
  const defaults = { duration: 0.4, ease: "power2.out" };
  const config = { ...defaults, ...options };
  
  if (isOpen) {
    return gsap.to(element, {
      height: "auto",
      opacity: 1,
      duration: config.duration,
      ease: config.ease,
      onStart: () => {
        element.style.visibility = "visible";
      },
    });
  } else {
    return gsap.to(element, {
      height: 0,
      opacity: 0,
      duration: config.duration,
      ease: config.ease,
      onComplete: () => {
        element.style.visibility = "hidden";
      },
    });
  }
};

/**
 * Tab Switch Animation
 */
export const tabSwitch = (element, options = {}) => {
  const defaults = { duration: 0.4, ease: "power2.out" };
  const config = { ...defaults, ...options };
  
  return gsap.fromTo(
    element,
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: config.duration, ease: config.ease }
  );
};

export default {
  fadeIn,
  slideUp,
  slideInLeft,
  slideInRight,
  staggerChildren,
  scrollReveal,
  countUpAnimation,
  hoverScale,
  rotate,
  pulse,
  shimmer,
  bounce,
  toggleCollapse,
  tabSwitch,
};
