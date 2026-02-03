export type BlogPost = {
  id: number;
  title: string;
  description: string;
  imageSrc: string;
  category: string;
  author: string;
  date: string;
  content: string[] | string;
};

type AdminBlogArticleItem = {
  id: number;
  cover: string;
  title: string;
  category: string;
  status: "publish" | "draft";
  content: string;
};

const BLOG_ARTICLES_STORAGE_KEY = "admin_blog_articles";

const buildDescriptionFromHtml = (html: string) => {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  return text.length > 140 ? `${text.slice(0, 140)}...` : text;
};

const formatDate = (d: Date) =>
  d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Hidden Gems in Bali You Should Visit",
    description:
      "Discover lesser-known spots in Bali that are perfect for recharging, photography, and authentic local experiences.",
    imageSrc: "/blog-image.jpeg",
    category: "Travel",
    author: "Rizqi Maulana",
    date: "Jan 29, 2026",
    content: [
      "Bali is famous for its beaches and vibrant nightlife, but the island also hides quiet corners that feel untouched. If you want a more relaxed itinerary, try balancing popular attractions with places that locals love.",
      "Start your day early. Sunrise hours are cooler, less crowded, and ideal for photos. Bring water, a light jacket for higher areas, and always keep small cash for parking fees and local vendors.",
      "For nature lovers, look for short hikes that lead to hidden viewpoints. Many of these spots are a bit off the main roads—so using a map app and saving offline routes can help.",
      "If you rent a scooter, double-check the brakes, lights, and tire pressure. If you’re not comfortable riding, hiring a driver for a half-day can be surprisingly affordable and much safer.",
      "Try to avoid over-scheduling. Hidden places often require detours, sudden stops, or extra time for weather. Keeping flexible gaps in your itinerary makes the whole trip feel calmer.",
      "When exploring quieter areas, practice responsible tourism: avoid stepping on coral, don’t feed wild animals, and bring back your trash. Small actions make a big impact.",
      "Finally, respect local customs. Dress modestly when visiting temples, be mindful during ceremonies, and keep the environment clean so these hidden gems stay beautiful for everyone.",
    ],
  },
  {
    id: 2,
    title: "How to Plan a Budget-Friendly Trip",
    description:
      "A practical guide to building an itinerary, choosing accommodation, and managing expenses without sacrificing comfort.",
    imageSrc: "/blog-image2.jpeg",
    category: "Tips",
    author: "Rizqi Maulana",
    date: "Jan 28, 2026",
    content: [
      "Budget travel is mostly about planning and priorities. Decide what matters most—food, comfort, activities, or shopping—then allocate more budget there and reduce spending on the rest.",
      "Book big-ticket items first. Flights and accommodations usually take the largest portion of your budget, so securing a good deal early can save you a lot.",
      "Use a simple daily budget. Track transport, meals, and entrance fees. If you overspend today, adjust tomorrow by choosing free activities or local street food.",
      "Whenever possible, use public transportation or shared rides. In many cities, day passes are cheaper than multiple single tickets and make your planning easier.",
      "For accommodation, compare locations—not just prices. A slightly more expensive place near the center can reduce your transport costs and save time.",
      "Pack smart to avoid last-minute purchases. A reusable bottle, a small umbrella, and basic medicine can prevent unnecessary spending.",
      "Lastly, keep a buffer for unexpected expenses. A small emergency fund keeps your trip stress-free when plans change.",
    ],
  },
  {
    id: 3,
    title: "Best Street Food Spots in Yogyakarta",
    description:
      "Must-try street food recommendations in Yogyakarta—from legendary classics to the latest viral spots.",
    imageSrc: "/blog-image3.jpg",
    category: "Food",
    author: "Rizqi Maulana",
    date: "Jan 27, 2026",
    content: [
      "Yogyakarta is a paradise for street food lovers. The best way to explore is to come hungry and try small portions from different stalls.",
      "Look for places with steady queues and high turnover—fresh ingredients matter. Don’t be afraid to ask locals for recommendations; they often know the best hidden spots.",
      "Balance your choices: something savory, something sweet, and a warm drink. If you have a sensitive stomach, bring medication and stick to cooked food.",
      "Go in the late afternoon or evening for the best atmosphere. Many popular areas come alive after sunset, and you’ll find more variety of stalls open.",
      "If you’re unsure what to order, start with the stall’s signature menu. The most-ordered items are usually the safest and most consistent.",
      "Take your time. Street food is about the experience—watching the cooking process, chatting with vendors, and enjoying the crowd.",
      "A food journey is also a cultural journey—enjoy the conversations, the atmosphere, and the stories behind each dish.",
    ],
  },
  {
    id: 4,
    title: "Minimalist Lifestyle for Travelers",
    description: "How to pack light, stay stylish, and keep healthy routines during long trips.",
    imageSrc: "/blog-image.jpeg",
    category: "Lifestyle",
    author: "Rizqi Maulana",
    date: "Jan 26, 2026",
    content: [
      "Minimalist travel starts with choosing versatile items. Pick clothes that match each other and work for multiple occasions.",
      "Keep your packing list short: essentials first, then comfort items. If you haven’t used something in the last two trips, you probably don’t need it.",
      "Staying healthy on the road is easier when you keep routines simple—hydration, walking, and consistent sleep times whenever possible.",
      "Try the one-in-one-out rule: if you add a new item, remove another. It forces you to stay intentional about what you carry.",
      "Use packing cubes or small pouches to keep categories organized. Minimalism isn’t only about less stuff—it’s also about less friction.",
      "Digital tools help a lot: store tickets, maps, and documents in one place. Fewer papers, fewer worries.",
      "A lighter bag means less stress. You move faster, spend less time packing, and enjoy the journey more.",
    ],
  },
  {
    id: 5,
    title: "3D2N Bandung Itinerary for First Timers",
    description:
      "A beginner-friendly Bandung route: iconic places, trending cafes, and easy-to-reach nature spots.",
    imageSrc: "/blog-image2.jpeg",
    category: "Travel",
    author: "Rizqi Maulana",
    date: "Jan 25, 2026",
    content: [
      "Bandung is perfect for a short getaway. With the right itinerary, you can enjoy city vibes and nature in just three days.",
      "Day one: explore city landmarks and try classic local food. Day two: head to cooler areas for scenic views and cafes. Day three: visit a relaxed spot before heading home.",
      "Use ride-hailing apps to save time and avoid parking stress. If you travel on weekends, start earlier to beat traffic.",
      "A smart tip: group locations by area. Bandung traffic can be unpredictable, so minimizing cross-city travel makes your day smoother.",
      "If you love shopping, dedicate a specific time block. It’s easy to lose half a day in factory outlets if you don’t plan it.",
      "Bring a light jacket. Evenings can get chilly in higher areas, especially after rain.",
      "Keep your itinerary flexible—Bandung has many spontaneous discoveries, especially with food and coffee.",
    ],
  },
  {
    id: 6,
    title: "Travel Safety Checklist",
    description:
      "A quick checklist for safer travel: documents, devices, budget planning, and other essentials.",
    imageSrc: "/blog-image3.jpg",
    category: "Tips",
    author: "Rizqi Maulana",
    date: "Jan 24, 2026",
    content: [
      "Safety begins before you leave. Scan your passport/ID, save digital copies, and share your itinerary with someone you trust.",
      "Secure your devices: enable screen locks, backups, and avoid connecting to unknown public Wi-Fi without protection.",
      "Carry a small first-aid kit and keep emergency numbers saved offline. Always keep some cash in a separate place.",
      "When you arrive, take a few minutes to learn the neighborhood. Identify the nearest minimarket, pharmacy, and a safe route back to your accommodation.",
      "For transportation, confirm prices before you ride when using non-meter taxis. If possible, use official apps or verified services.",
      "Trust your instincts. If a situation feels off, leave. Your comfort and safety matter more than being polite.",
      "The goal isn’t to worry—it’s to be prepared so you can enjoy the trip with confidence.",
    ],
  },
  {
    id: 7,
    title: "Coffee Guide: Finding the Best Local Cafes",
    description:
      "Tips for choosing great local cafes for working, hanging out, and exploring regional coffee flavors.",
    imageSrc: "/blog-image.jpeg",
    category: "Food",
    author: "Rizqi Maulana",
    date: "Jan 23, 2026",
    content: [
      "A great cafe isn’t only about coffee—it’s about comfort, service, and atmosphere. Start by checking their menu focus: espresso-based, manual brew, or signature drinks.",
      "For working, prioritize seating, power outlets, and stable internet. For hanging out, look for comfortable spaces and music volume.",
      "Ask the barista about local beans. Many cafes proudly use regional beans with unique flavor profiles.",
      "If you’re exploring a new city, try one cafe per area. You’ll discover different vibes and avoid spending too much time commuting.",
      "Don’t ignore the basics: clean tables, friendly service, and consistent drinks are often better indicators than flashy interior design.",
      "If you find a good spot, support them—order a snack, leave a fair tip when appropriate, and share a thoughtful review.",
      "Try one classic cup first. If it’s good, explore their signature drinks next.",
    ],
  },
  {
    id: 8,
    title: "Healthy Habits While Traveling",
    description: "Healthy habits while traveling: sleep, hydration, walking, and balanced meals.",
    imageSrc: "/blog-image2.jpeg",
    category: "Lifestyle",
    author: "Rizqi Maulana",
    date: "Jan 22, 2026",
    content: [
      "Travel routines can be unpredictable, but your health doesn’t have to be. Small habits make a big difference.",
      "Drink water regularly, especially in hot climates. Walking is an easy way to stay active while exploring.",
      "Balance your meals: enjoy local food, but add fruits and vegetables whenever you can.",
      "Try to avoid extreme schedules for too many days in a row. A single slow morning can reset your energy and improve the rest of the trip.",
      "If you’re changing time zones, get sunlight in the morning and reduce screen time at night. It helps your body adjust faster.",
      "Listen to your body. Rest isn’t wasting time—it’s what keeps you able to enjoy the journey.",
      "Good sleep improves your mood and energy—plan your schedule so you don’t sacrifice rest too often.",
    ],
  },
];

export const getBlogPosts = (): BlogPost[] => {
  if (typeof window === "undefined") return blogPosts;

  try {
    const raw = window.localStorage.getItem(BLOG_ARTICLES_STORAGE_KEY);
    if (!raw) return blogPosts;

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return blogPosts;

    const adminArticles = parsed as AdminBlogArticleItem[];
    const published = adminArticles.filter((a) => a?.status === "publish");
    if (published.length === 0) return blogPosts;

    return published.map((a) => ({
      id: a.id,
      title: a.title,
      description: buildDescriptionFromHtml(a.content),
      imageSrc: a.cover || "/placeholder-image.png",
      category: a.category || "Uncategorized",
      author: "Admin",
      date: formatDate(new Date()),
      content: a.content,
    }));
  } catch {
    return blogPosts;
  }
};
