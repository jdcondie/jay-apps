import { AdTemplate, AspectRatio } from './types';
import { SquareIcon, WideIcon, VerticalIcon } from './components/icons/AspectRatioIcons';

export const ASPECT_RATIOS: AspectRatio[] = [
  { id: 'square', name: 'Square', value: '1:1', icon: SquareIcon },
  { id: 'widescreen', name: 'Widescreen', value: '16:9', icon: WideIcon },
  { id: 'vertical', name: 'Vertical', value: '9:16', icon: VerticalIcon },
];

export const AD_TEMPLATES: AdTemplate[] = [
  {
    id: 'sunlit-variety',
    name: 'Sunlit Variety',
    description: 'Multiple product units on a warm wooden surface with dramatic sunlight and long shadows.',
    keywords: 'warm, wooden, sunlight, shadows, premium, artisanal',
    previewUrl: '/input_file_0.png?v=3',
    referenceImageUrl: '/input_file_0.png?v=3',
    category: 'Studio',
    promptTemplate: 'Multiple units of the product (the subject image) arranged on a warm, textured wooden surface. Dramatic, high-contrast natural sunlight streams across the scene from the side, creating long, sharp shadows. The lighting is warm and golden, giving a premium, artisanal feel. Professional product photography, 8k, realistic textures.'
  },
  {
    id: 'testimonial-comparison',
    name: 'Testimonial Comparison',
    description: 'High-impact ad with a testimonial quote, a discount badge, and a wellness focus.',
    keywords: 'testimonial, discount, wellness, comparison, clean',
    previewUrl: '/input_file_1.png?v=3',
    referenceImageUrl: '/input_file_1.png?v=3',
    category: 'Creative',
    promptTemplate: 'A high-impact health-focused advertisement. In the center is a close-up of a person\'s mouth showing skin damage labeled "Damage from nicotine pouches". The product (the subject image) is placed in the bottom left corner. A bright green circular badge says "SAVE UP TO 45% OFF". At the top, a large testimonial box with a quote and a customer name. Professional medical/commercial layout.'
  },
  {
    id: 'vibrant-fruit-burst',
    name: 'Vibrant Fruit Burst',
    description: 'Bright, energetic announcement with floating fruit and a pop-art feel.',
    keywords: 'vibrant, fruit, energetic, pop-art, bright',
    previewUrl: '/input_file_2.png?v=3',
    referenceImageUrl: '/input_file_2.png?v=3',
    category: 'Studio',
    promptTemplate: 'A bright and energetic product announcement. The product (the subject image) is the central focus, angled dynamically. It is surrounded by oversized, realistic floating blue raspberries with green leaves at the corners. The background is a clean, vibrant blue gradient. Bold "INTRODUCING" and "BLUE RASPBERRY" text in a modern, heavy font.'
  },
  {
    id: 'athletic-performance',
    name: 'Athletic Performance',
    description: 'Dynamic sports-focused ad with a runner on a track and bold typography.',
    keywords: 'athletic, performance, sports, runner, dynamic',
    previewUrl: '/input_file_3.png?v=3',
    referenceImageUrl: '/input_file_3.png?v=3',
    category: 'Lifestyle',
    promptTemplate: 'A dynamic sports-focused advertisement. The product (the subject image) is sharp and clear in the center foreground. The background is a motion-blurred shot of a muscular runner on an athletic track. Bold yellow text at the top says "ENERGY POUCHES BUILT FOR RUNNERS". High-energy, high-contrast aesthetic.'
  },
  {
    id: 'moody-hand-off',
    name: 'Moody Hand-off',
    description: 'Cinematic ad showing a hand-off in a dark, moody environment with dramatic lighting.',
    keywords: 'moody, cinematic, hands, dramatic, interaction',
    previewUrl: '/input_file_4.png?v=3',
    referenceImageUrl: '/input_file_4.png?v=3',
    category: 'Lifestyle',
    promptTemplate: 'A cinematic, moody advertisement. Two hands are shown in a close-up, one person passing the product (the subject image) to another. The background is dark and out of focus, showing a muscular torso. At the top, a 5-star rating and text "4.7 STARS FROM 30,000+ CUSTOMERS". Large bold text says "UPGRADE YOUR VICE". High-end commercial photography with dramatic lighting.'
  },
  {
    id: 'dark-refreshment',
    name: 'Dark Refreshment',
    description: 'Sleek ad with fresh lime slices and a dark, textured background.',
    keywords: 'refreshing, lime, dark, textured, sleek',
    previewUrl: '/input_file_5.png?v=3',
    referenceImageUrl: '/input_file_5.png?v=3',
    category: 'Studio',
    promptTemplate: 'A sleek and refreshing "LIMITED RELEASE!" advertisement. The product (the subject image) is placed centrally on a dark, textured black background. It is accompanied by fresh, vibrant lime slices and loose white product pouches spilling out. Bold lime-green text at the top and bottom says "LIMITED RELEASE!" and "CLEAN & REFRESHING". Sharp, focused lighting.'
  },
  {
    id: 'ingredient-infographic',
    name: 'Ingredient Infographic',
    description: 'Technical infographic ad highlighting ingredients with glowing lines and a dark atmosphere.',
    keywords: 'infographic, technical, ingredients, science, precision',
    previewUrl: '/input_file_6.png?v=3',
    referenceImageUrl: '/input_file_6.png?v=3',
    category: 'Creative',
    promptTemplate: 'A technical, science-focused infographic advertisement. The product (the subject image) is in the center, with glowing teal lines pointing to various ingredients in small glass containers arranged around it (e.g., white powder, papaya). Each ingredient has a label like "100mg CAFFEINE ANHYDROUS". The background is a dark, atmospheric teal space. Professional, precise, and high-tech look.'
  },
  {
    id: 'gym-and-gains',
    name: 'Gym & Gains',
    description: 'High-intensity fitness ad with a gym background and powerful typography.',
    keywords: 'gym, fitness, gains, strength, powerful',
    previewUrl: '/input_file_7.png?v=3',
    referenceImageUrl: '/input_file_7.png?v=3',
    category: 'Lifestyle',
    promptTemplate: 'A high-intensity fitness advertisement. The product (the subject image) is in the foreground, sharp and clear. The background shows a person in a gym, motion-blurred, near a heavy barbell with "ROGUE" plates. Bold yellow text says "ENERGY POUCHES" and "BUILT FOR HIGH REPS AND BIG GAINS". Gritty, powerful gym aesthetic.'
  },
  {
    id: 'desk-flow-state',
    name: 'Desk Flow State',
    description: 'Modern workspace ad symbolizing clarity and focus with a desk setting.',
    keywords: 'workspace, desk, flow-state, focus, clarity',
    previewUrl: '/input_file_8.png?v=3',
    referenceImageUrl: '/input_file_8.png?v=3',
    category: 'Room',
    promptTemplate: 'A modern workspace advertisement. The product (the subject image) is placed on a clean desk, propped up against a crushed silver soda can labeled "LIQUID ANXIETY". Other cans labeled "ENERGY DRINK" and "JITTER JUICE" are in the blurred background. Bold text at the top says "THIS IS FLOW STATE". Clean, productive, and focused aesthetic.'
  }
];
