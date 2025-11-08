"use client";

import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";

const mentor = {
  name: "Dr. Sanjukta Rani Jena",
  role: "Assistant Professor, SPIT",
  desc: "A guiding force and constant source of inspiration. Dr. Jena specializes in Artificial Intelligence and Data Science, mentoring us throughout the project with her valuable insights and expertise.",
  img: "/team/default.png",
  linkedin: "https://www.linkedin.com/in/dr-sanjuktarani-jena-0b7329159/",
};

const teamMembers = [
  {
    name: "Dishant Visariya",
    role: "AI/ML Engineer",
    desc: "Focuses on deep learning, computer vision, and intelligent detection systems.",
    img: "/team/default.png",
    linkedin: "https://www.linkedin.com/in/dishant-visariya-42b353283/",
  },
  {
    name: "Mukul Vaidya",
    role: "Backend Developer",
    desc: "Develops scalable FastAPI services and optimizes backend data flows.",
    img: "/team/default.png",
    linkedin: "https://www.linkedin.com/in/mukul-vaidya-08983231a/",
  },
  {
    name: "Kalp Vora",
    role: "Frontend Developer",
    desc: "Designs responsive UIs using React and Tailwind for a seamless experience.",
    img: "/team/default.png",
    linkedin: "https://www.linkedin.com/in/kalp-vora/",
  },
];

export default function TeamPage() {
  return (
    <main className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-center"
      >
        Our Team
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-400 max-w-2xl text-center mb-8"
      >
        Meet the brilliant minds and mentor guiding our journey — building intelligent, real-world solutions through innovation and teamwork.
      </motion.p>

      {/* Mentor Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 border border-blue-500/30 rounded-3xl p-6 text-center backdrop-blur-md shadow-lg hover:shadow-blue-500/20 mb-10 transition-all w-[90%] sm:w-[60%] lg:w-[45%]"
      >
        <div
          className="relative group cursor-pointer"
          onClick={() => window.open(mentor.linkedin, "_blank")}
        >
          <img
            src={mentor.img}
            alt={mentor.name}
            className="w-28 h-28 mx-auto rounded-full object-cover border-2 border-blue-500/40 group-hover:border-blue-400 transition-all shadow-md"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
            <Linkedin className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <h2 className="mt-4 text-2xl font-semibold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
          {mentor.name}
        </h2>
        <p className="text-blue-400 font-medium mt-1">{mentor.role}</p>
        <p className="text-gray-300 text-sm mt-2">{mentor.desc}</p>
      </motion.div>

      {/* Team Members Row */}
      <div className="flex flex-wrap justify-center gap-8 px-4">
        {teamMembers.map((member, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className="w-64 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:scale-105 hover:border-blue-500/40 hover:bg-white/10 transition-all duration-300 shadow-md hover:shadow-blue-500/10 text-center"
          >
            <div
              className="relative group cursor-pointer"
              onClick={() => window.open(member.linkedin, "_blank")}
            >
              <img
                src={member.img}
                alt={member.name}
                className="w-24 h-24 mx-auto rounded-full object-cover border-2 border-blue-500/30 group-hover:border-blue-400 transition-all"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                <Linkedin className="w-6 h-6 text-blue-400" />
              </div>
            </div>

            <h3 className="mt-3 text-lg font-semibold text-white">
              {member.name}
            </h3>
            <p className="text-sm text-blue-400">{member.role}</p>
            <p className="text-gray-400 text-xs mt-2">{member.desc}</p>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
