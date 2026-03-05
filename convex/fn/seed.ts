// all ai slop for testing

import { v } from "convex/values";
import { mutationWithPermission } from ".";
import { computeWeightedTotal, getRubricForType } from "@/lib/review/scoring";
import { FLAG_REASONS } from "@/lib/review/rubric";
import type { ApplicationType } from "@/lib/review/rubric";
import type { Id, DataModel } from "../_generated/dataModel";
import type { GenericDatabaseWriter } from "convex/server";

const SEED_PREFIX = "seed_";

// ─── Fake data pools ─────────────────────────────────────────────────

const FIRST_NAMES = [
  "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn",
  "Skyler", "Dakota", "Reese", "Finley", "Harper", "Rowan", "Sage", "Kai",
  "Emery", "Blair", "Charlie", "Drew", "Hayden", "Jamie", "Logan", "Parker",
  "Peyton", "River", "Sydney", "Cameron", "Elliot", "Frankie",
];

const LAST_NAMES = [
  "Chen", "Patel", "Kim", "Nguyen", "Singh", "Garcia", "Williams", "Johnson",
  "Brown", "Martinez", "Lee", "Thompson", "White", "Harris", "Clark", "Lewis",
  "Robinson", "Walker", "Young", "Hall", "Allen", "Wright", "King", "Scott",
  "Adams", "Baker", "Green", "Hill", "Nelson", "Mitchell",
];

const SCHOOLS = [
  "Westfield High School", "Riverside Secondary", "Central Tech Academy",
  "Lakewood High", "Northview Collegiate", "Eastdale Academy",
  "Parkside Secondary School", "Bayview Heights High", "Oakridge Preparatory",
  "Summit Hill Academy", "Maple Leaf Secondary", "Valley Stream High",
  "Harbour View Academy", "Crestwood Collegiate", "Pinewood High School",
];

const SKILLS = [
  "Python", "JavaScript", "TypeScript", "React", "HTML/CSS", "Java", "C++",
  "Scratch", "Swift", "Figma", "Git", "Node.js", "SQL", "Arduino",
  "Machine Learning", "Unity", "Blender", "Photoshop", "Go", "Rust",
];

const INTERESTS = [
  "Web Development", "Game Design", "AI & Machine Learning", "Mobile Apps",
  "Cybersecurity", "Data Science", "Robotics", "UI/UX Design",
  "Open Source", "Cloud Computing", "Blockchain", "IoT",
  "Digital Art", "Music Production", "3D Printing",
];

const BIOS = [
  "High school student passionate about coding and building cool projects.",
  "Aspiring software engineer who loves learning new technologies.",
  "Creative thinker interested in the intersection of design and technology.",
  "Self-taught programmer excited to attend my first hackathon!",
  "Robotics club member looking to expand into web development.",
  "Passionate about using technology to solve real-world problems.",
  "Math enthusiast exploring the world of programming.",
  "Future computer scientist interested in AI and machine learning.",
  "Love building things and collaborating with other students.",
  "Dedicated learner who spends weekends on side projects.",
];

const WHY_ATTEND_RESPONSES = [
  "I'm really excited about hack4us because I've been teaching myself to code for the past year and I want to challenge myself by building something real in a weekend. I think the collaborative environment will push me to learn faster and meet other students who share my passion for technology. I'm especially interested in working on a project that could help my local community.",
  "I want to attend hack4us to experience what it's like to build a project from scratch with a team. I've been coding solo for a while and I think a hackathon is the perfect way to learn collaboration skills and get feedback from mentors. Plus, I've never done anything like this before and it sounds like an amazing opportunity!",
  "hack4us caught my eye because it's beginner-friendly and I'm still pretty new to programming. I've been learning Python in school but I want to try building something bigger. I'm hoping to meet other students, learn from mentors, and maybe discover what area of tech I want to focus on in university.",
  "I love the idea of spending a weekend surrounded by creative people building cool things. I've done a couple of small projects on my own but never anything collaborative. I want to push my boundaries, learn new tools, and have fun while doing it. The workshops and mentorship aspect is really appealing to me.",
  "Technology has always fascinated me and I want to explore how I can use it to make a positive impact. hack4us seems like the perfect place to learn, build, and connect with like-minded students. I'm eager to step out of my comfort zone and try something new!",
  "I've been wanting to participate in a hackathon for so long and hack4us looks like the perfect fit. I love that it's focused on learning and growth rather than just competition. I want to improve my skills, try new technologies, and build something I can be proud of.",
  "As someone who's been coding for about two years now, I feel ready to take on a bigger challenge. hack4us would be my first hackathon and I'm excited about the chance to work intensively on a project. I also really want to meet other young people who are into tech.",
  "I want to attend because I believe hackathons are one of the best ways to learn and grow as a developer. The time pressure forces you to be creative and resourceful. I'm particularly excited about the mentorship opportunities and the chance to work on something meaningful.",
];

const PROUD_PROJECT_RESPONSES = [
  "Last year I built a Discord bot for my school's coding club that tracks members' contributions and gives out weekly shoutouts. It started as a simple script but I ended up learning about databases and hosting. Seeing people actually use it every day was the best feeling — it made me realize I love building things that help communities.",
  "I'm really proud of a short film I made for a school project about climate change in our city. I did all the filming, editing, and even composed the background music. It ended up winning our school's media competition and was screened at a local youth film festival.",
  "I taught myself to sew and made my own prom outfit from scratch. It took about three months of learning patterns, making mistakes, and starting over. The final result wasn't perfect but I wore it with so much pride knowing every stitch was mine.",
  "I organized a coding workshop series at my school for students who had never programmed before. Over four weeks, I taught 15 classmates the basics of HTML, CSS, and JavaScript. By the end, everyone had their own personal website deployed. It was incredibly rewarding to see their excitement.",
  "I built a weather dashboard using React and a public API. It shows real-time conditions, a 5-day forecast, and I even added a feature that suggests outfits based on the weather. It's nothing groundbreaking but I learned so much about APIs, state management, and responsive design.",
  "I volunteered to redesign my local library's website. The old one was really hard to navigate, especially for older visitors. I spent a couple of months working with the librarians to understand their needs and built something much more accessible. They're still using it!",
  "I created a mobile game in Unity for a school talent show. It was a simple platformer but I designed all the pixel art myself and wrote the game logic from scratch. People were actually lining up to play it at the show, which was surreal.",
  "My proudest project is a garden I built with my family. We converted a patch of our backyard into a vegetable garden with raised beds, a drip irrigation system, and a small greenhouse. I used a Raspberry Pi to automate the watering schedule based on soil moisture sensors.",
];

const GET_OUT_OF_IT_RESPONSES = [
  "I really want to learn how to work on a project under time pressure and with a team. In school, most projects stretch over weeks, so I've never had the experience of building something start-to-finish in a single weekend. I think that kind of intensity will teach me a lot about prioritizing, communicating, and shipping something real.",
  "Honestly, I want to figure out what I actually enjoy in tech. I've dabbled in web dev, a little Python, and some design, but I haven't found my 'thing' yet. I'm hoping that by being surrounded by people working on different kinds of projects, I'll get exposed to areas I haven't tried before.",
  "I'd love to walk away with at least one new technical skill I can keep building on. Whether that's learning a new framework, getting better at git, or finally understanding how APIs work — I want something concrete I can point to and say 'I learned that at Hack4Us.'",
  "I want to make friends who are into the same stuff as me. At my school there aren't many people who code or build things for fun, so it can feel a little isolating. Meeting other students who are passionate about tech would mean a lot to me.",
  "I'm hoping to get better at presenting my ideas. I tend to build things but then never show them to anyone because I'm nervous about what people will think. A hackathon feels like a safe space to practice pitching and getting feedback.",
  "I want the experience of taking an idea from zero to something demoable. I've started a lot of side projects but rarely finish them. The deadline and team accountability of a hackathon might be exactly what I need to actually ship something.",
  "More than anything, I want to be inspired. I want to see what other students my age are capable of building and let that motivate me to aim higher with my own projects.",
  "I'd like to get mentorship and feedback from experienced developers. I've been learning on my own from YouTube and docs, but I've never had someone look at my code and tell me what I could do better. That kind of guidance would be incredibly valuable.",
];

const LIFETIME_GOAL_RESPONSES = [
  "I want to start a tech company that makes education more accessible for students in underserved communities. I've seen firsthand how unequal access to technology and learning resources can be, and I want to build tools that help close that gap.",
  "My lifetime goal is to become a doctor who also builds health-tech tools. I love both biology and programming, and I think there's so much potential at the intersection. I want to use technology to improve patient care and make medical information more accessible.",
  "I want to travel to every continent and document the experience through photography and writing. I've been keeping a blog since I was 14 and I dream of turning it into something that inspires other young people to explore the world.",
  "I want to work at a major tech company and eventually lead a team that builds products used by millions of people. I know it's a long road, but every project I work on is a step in that direction.",
  "My goal is to become a professor and researcher in AI. I'm fascinated by how machines can learn and I want to contribute to making AI safer and more beneficial for society. I'd also love to teach and mentor the next generation of researchers.",
  "I want to build something that outlasts me — whether it's a piece of software, a community, or an organization that keeps making a positive impact long after I'm gone. Legacy matters to me.",
  "I dream of creating a nonprofit that teaches coding to kids in rural areas. Growing up, I didn't have access to CS classes until high school, and I want to change that for the next generation.",
  "My lifetime goal is to become financially independent through my own ventures and then spend most of my time on passion projects and giving back. I want the freedom to work on what matters to me, not just what pays the bills.",
];

const WHY_MENTOR_RESPONSES = [
  "I've been working as a software developer for three years and I remember how impactful my first hackathon mentor was. I want to give back to the community and help young developers overcome the technical hurdles that can be so frustrating when you're starting out. There's nothing more rewarding than watching someone's face light up when their code finally works.",
  "I'm passionate about education and introducing young people to technology. I've mentored at two previous hackathons and loved every minute of it. I find that helping students debug their code and think through architecture problems actually makes me a better developer too.",
  "As a senior CS student, I want to share what I've learned with high school students who are just getting started. I've tutored peers in my university's CS program and I think my recent experience as a learner myself helps me connect with students who are struggling.",
  "I believe every student deserves access to mentorship in tech. I want to volunteer my time at hack4us because I know how much of a difference a good mentor can make. I'm experienced in web development and I love explaining complex concepts in simple terms.",
  "I've been a professional developer for five years and I've always enjoyed teaching. I've run workshops at my company and spoken at local meetups. hack4us is exactly the kind of event where I can make the biggest impact — helping motivated students bring their ideas to life.",
  "I want to mentor because I think hackathons are transformative experiences for young people, and having a supportive mentor is key to that. I remember feeling lost at my first hackathon and I want to be the person who helps students feel confident and supported.",
];

const WHY_VOLUNTEER_RESPONSES = [
  "I want to volunteer at hack4us because I love being part of events that bring people together. I've volunteered at school events and community fundraisers before, and I'm always energized by helping things run smoothly behind the scenes. I may not be the most technical person, but I want to support the students who are building amazing projects.",
  "I've been to a couple of hackathons as a participant and now I want to give back by helping organize one. I know how important logistics are to making an event feel welcoming and well-run. I'm reliable, organized, and excited to contribute wherever I'm needed.",
  "I volunteer because I believe in creating inclusive spaces for learning. hack4us sounds like an incredible initiative and I want to be part of making it happen. Whether it's registration, food coordination, or general support, I'm happy to pitch in.",
  "I'm passionate about the tech community and I think events like hack4us are so important for getting young people excited about technology. I want to help create the best possible experience for all the participants by volunteering my time and energy.",
  "I've volunteered at several community events before and I love the fast-paced, teamwork-oriented nature of event volunteering. I'm organized, friendly, and great at problem-solving on the fly. I'd be thrilled to support hack4us in any way I can.",
  "Volunteering at hack4us would be my first time at a hackathon and I'm excited to see what it's all about while contributing to the event. I'm a quick learner and I'm comfortable with both technical setup and people-facing roles.",
];

const EMERGENCY_CONTACTS = [
  "Jane Smith — (416) 555-0123",
  "Robert Chen — (905) 555-0456",
  "Maria Garcia — (647) 555-0789",
  "David Kim — (416) 555-0321",
  "Sarah Patel — (905) 555-0654",
  "Michael Johnson — (647) 555-0987",
  "Lisa Williams — (416) 555-1234",
  "James Brown — (905) 555-5678",
];

const TSHIRT_SIZES = ["xs", "s", "m", "m", "m", "l", "l", "xl", "xxl"];

const DIETARY_OPTIONS = [
  "",
  '{"selected":["vegetarian"],"other":""}',
  '{"selected":["vegan"],"other":""}',
  '{"selected":["halal"],"other":""}',
  '{"selected":["gluten_free"],"other":""}',
  '{"selected":["vegetarian","gluten_free"],"other":""}',
  '{"selected":[],"other":"No peanuts please"}',
  '{"selected":["kosher"],"other":""}',
];

// ─── Deterministic pick helper ───────────────────────────────────────

function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length];
}

function pickN<T>(arr: readonly T[], index: number, count: number): T[] {
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    const item = arr[(index + i * 7) % arr.length];
    if (!result.includes(item)) result.push(item);
  }
  return result;
}

// ─── Answer generators per type ──────────────────────────────────────

function generateAttendeeAnswers(i: number): Record<string, string> {
  return {
    hackathonCount: pick(["0", "1", "2-5", "5+"], i),
    proudProject: pick(PROUD_PROJECT_RESPONSES, i),
    whyAttend: pick(WHY_ATTEND_RESPONSES, i),
    getOutOfIt: pick(GET_OUT_OF_IT_RESPONSES, i),
    lifetimeGoal: pick(LIFETIME_GOAL_RESPONSES, i),
    teamPreference: pick(["solo", "looking", "have_team"], i),
    dietaryRestrictions: pick(DIETARY_OPTIONS, i),
    tshirtSize: pick(TSHIRT_SIZES, i),
    emergencyContact: pick(EMERGENCY_CONTACTS, i),
  };
}

function generateMentorAnswers(i: number): Record<string, string> {
  const expertiseOptions = ["frontend", "backend", "mobile", "ai_ml", "data_science", "devops", "design", "hardware", "game_dev", "cybersecurity"];
  const availOptions = ["sat_morning", "sat_afternoon", "sat_evening", "sun_morning", "sun_afternoon"];
  return {
    expertise: JSON.stringify(pickN(expertiseOptions, i, 2 + (i % 3))),
    yearsExperience: pick(["0", "1-2", "3-5", "5+"], i),
    previousMentoring: pick(["yes", "other", "no"], i),
    whyMentor: pick(WHY_MENTOR_RESPONSES, i),
    availability: JSON.stringify(pickN(availOptions, i, 2 + (i % 3))),
    dietaryRestrictions: pick(DIETARY_OPTIONS, i),
    tshirtSize: pick(TSHIRT_SIZES, i),
  };
}

function generateVolunteerAnswers(i: number): Record<string, string> {
  const roleOptions = ["checkin", "tech_support", "food", "judging", "workshops", "media", "general"];
  const availOptions = ["sat_morning", "sat_afternoon", "sat_evening", "sun_morning", "sun_afternoon"];
  return {
    previousVolunteering: pick(["yes", "other", "no"], i),
    whyVolunteer: pick(WHY_VOLUNTEER_RESPONSES, i),
    preferredRoles: JSON.stringify(pickN(roleOptions, i, 2 + (i % 3))),
    availability: JSON.stringify(pickN(availOptions, i, 2 + (i % 3))),
    dietaryRestrictions: pick(DIETARY_OPTIONS, i),
    tshirtSize: pick(TSHIRT_SIZES, i),
  };
}

const answerGenerators: Record<ApplicationType, (i: number) => Record<string, string>> = {
  attendee: generateAttendeeAnswers,
  mentor: generateMentorAnswers,
  volunteer: generateVolunteerAnswers,
};

// ─── Profile generator ───────────────────────────────────────────────

function generateProfile(type: string, i: number) {
  const role = type === "attendee" ? "attendee" as const
    : type === "mentor" ? "mentor" as const
    : "volunteer" as const;

  return {
    userId: `${SEED_PREFIX}${type}_${i}`,
    role,
    educationLevel: pick(["high_school", "university"] as const, i),
    birthdate: `200${7 + (i % 3)}-${String(1 + (i % 12)).padStart(2, "0")}-${String(1 + (i % 28)).padStart(2, "0")}`,
    school: pick(SCHOOLS, i),
    year: pick(["9", "10", "11", "12"], i),
    bio: pick(BIOS, i),
    skills: pickN(SKILLS, i, 3 + (i % 4)),
    interests: pickN(INTERESTS, i, 2 + (i % 3)),
    completedOnboarding: true,
    links: {
      github: `https://github.com/${pick(FIRST_NAMES, i).toLowerCase()}${pick(LAST_NAMES, i).toLowerCase()}`,
      external: [] as string[],
    },
  };
}

// ─── Shared clear logic ──────────────────────────────────────────────

async function clearAllSeedData(db: GenericDatabaseWriter<DataModel>) {
  const counts = { profiles: 0, applications: 0, reviews: 0, flags: 0, comments: 0 };

  const allApplications = await db.query("application").collect();
  const seedApps = allApplications.filter((a) => a.userId.startsWith(SEED_PREFIX));

  for (const app of seedApps) {
    const reviews = await db
      .query("review")
      .withIndex("applicationId", (q) => q.eq("applicationId", app._id))
      .collect();
    for (const review of reviews) {
      await db.delete(review._id);
      counts.reviews++;
    }

    const flags = await db
      .query("applicationFlag")
      .withIndex("applicationId", (q) => q.eq("applicationId", app._id))
      .collect();
    for (const flag of flags) {
      await db.delete(flag._id);
      counts.flags++;
    }

    const comments = await db
      .query("applicationComments")
      .withIndex("applicationId", (q) => q.eq("applicationId", app._id))
      .collect();
    for (const comment of comments) {
      await db.delete(comment._id);
      counts.comments++;
    }

    await db.delete(app._id);
    counts.applications++;
  }

  const allProfiles = await db.query("userProfile").collect();
  const seedProfiles = allProfiles.filter((p) => p.userId.startsWith(SEED_PREFIX));

  for (const profile of seedProfiles) {
    await db.delete(profile._id);
    counts.profiles++;
  }

  return counts;
}

// ─── Seed mutation ───────────────────────────────────────────────────

const adminMutation = mutationWithPermission({ adminDashboard: ["view"] });

export const seedApplications = adminMutation({
  args: {
    attendees: v.number(),
    mentors: v.number(),
    volunteers: v.number(),
  },
  handler: async (ctx, args) => {
    // Clear any existing seed data first so re-running always works
    await clearAllSeedData(ctx.db);

    const counts = { profiles: 0, applications: 0, reviews: 0, aiScores: 0, flags: 0 };

    const types: { type: ApplicationType; count: number }[] = [
      { type: "attendee", count: args.attendees },
      { type: "mentor", count: args.mentors },
      { type: "volunteer", count: args.volunteers },
    ];

    // Track all created application IDs for review/flag generation
    const createdApps: { id: Id<"application">; type: ApplicationType; index: number }[] = [];

    for (const { type, count } of types) {
      const generateAnswers = answerGenerators[type];
      const rubric = getRubricForType(type);

      for (let i = 0; i < count; i++) {
        const userId = `${SEED_PREFIX}${type}_${i}`;

        // Create profile
        const profile = generateProfile(type, i);
        await ctx.db.insert("userProfile", profile);
        counts.profiles++;

        // Create submitted application
        const submittedAt = Date.now() - (count - i) * 3_600_000; // Stagger by 1h each
        const applicationId = await ctx.db.insert("application", {
          userId,
          type,
          status: "submitted",
          answers: generateAnswers(i),
          submittedAt,
        });
        counts.applications++;

        // ~60% get AI scores
        if (i % 5 !== 0 && i % 5 !== 1) {
          const scores: Record<string, number> = {
            effort: 1 + ((i * 3 + 2) % 5),
            motivation: 1 + ((i * 7 + 1) % 5),
            communityFit: 1 + ((i * 11 + 3) % 5),
          };
          const total = computeWeightedTotal(scores, rubric);
          await ctx.db.patch(applicationId, {
            aiScore: {
              scores,
              total,
              summary: `${pick(FIRST_NAMES, i)} shows ${scores.effort >= 4 ? "strong" : scores.effort >= 2 ? "moderate" : "limited"} effort and ${scores.motivation >= 4 ? "genuine enthusiasm" : "interest"} for the event.`,
              flags: scores.effort <= 1 ? ["Low effort responses"] : [],
            },
          });
          counts.aiScores++;
        }

        createdApps.push({ id: applicationId, type, index: i });

        // ~10% get decisions
        if (i % 10 === 0) {
          const decisionStatus = pick(
            ["accepted", "rejected", "waitlist"] as const,
            i,
          );
          await ctx.db.patch(applicationId, {
            decision: {
              status: decisionStatus,
              at: Date.now(),
              by: ctx.userId,
            },
          });
        }
      }
    }

    // Generate reviews: ~40% of applications get 1-2 reviews
    const reviewerIds = Array.from({ length: 5 }, (_, i) => `${SEED_PREFIX}reviewer_${i}`);

    for (const { id: applicationId, type, index: i } of createdApps) {
      if (i % 5 < 2) continue; // skip ~40%

      const reviewCount = i % 3 === 0 ? 2 : 1;
      const rubric = getRubricForType(type);

      for (let r = 0; r < reviewCount; r++) {
        const reviewerId = pick(reviewerIds, i + r * 3);
        const scores: Record<string, number> = {
          effort: 1 + ((i * 3 + r * 2 + 1) % 5),
          motivation: 1 + ((i * 5 + r * 3 + 2) % 5),
          communityFit: 1 + ((i * 7 + r * 5 + 3) % 5),
        };
        const total = computeWeightedTotal(scores, rubric);

        await ctx.db.insert("review", {
          applicationId,
          reviewerId,
          scores,
          total,
          createdAt: Date.now() - (createdApps.length - i) * 1_800_000,
        });
        counts.reviews++;
      }

      // ~5% of apps get a flag (roughly every 20th among reviewed apps)
      if (i % 20 === 5) {
        const flagReason = pick(FLAG_REASONS, i);
        await ctx.db.insert("applicationFlag", {
          applicationId,
          reviewerId: pick(reviewerIds, i),
          reason: flagReason.id,
          details: flagReason.id === "other" ? "Seems like a duplicate application" : undefined,
          createdAt: Date.now(),
        });
        counts.flags++;
      }
    }

    return counts;
  },
});

// ─── Clear mutation ──────────────────────────────────────────────────

export const clearSeedData = adminMutation({
  args: {},
  handler: async (ctx) => {
    return await clearAllSeedData(ctx.db);
  },
});
