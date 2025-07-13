"use client";
import React, { useEffect, useState } from "react";
import { DiMongodb, DiMysql } from "react-icons/di";
import {
  FaCss3,
  FaGit,
  FaHtml5,
  FaNodeJs,
  FaReact,
  FaVuejs,
} from "react-icons/fa6";
import {
  RiTailwindCssFill,
} from "react-icons/ri";
import {
  SiExpress,
  SiJavascript,
  SiNestjs,
  SiTypescript,
} from "react-icons/si";
import Image from "next/image";
// @ts-ignore
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";

const TOOLS = [
  {
    name: "JavaScript",
    icon: <SiJavascript size={"50px"} color={"#f0db4f"} />,
  },
  {
    name: "TypeScript",
    icon: <SiTypescript size={"50px"} color={"#007acc"} />,
  },
  {
    name: "HTML",
    icon: <FaHtml5 size={"50px"} color="#e34c26" />,
  },
  {
    name: "CSS",
    icon: <FaCss3 size={"50px"} color="#563d7c" />,
  },
  {
    name: "React",
    icon: <FaReact size={"50px"} color="#61dafb" />,
  },
  {
    name: "Vue",
    icon: <FaVuejs size={"50px"} color="#41b883" />,
  },
  {
    name: "Next.js",
    icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" width={50} height={50} alt="Next.js" />,
  },
  {
    name: 'Sass',
    icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg" width={50} height={50} alt="Sass" />,
  },
  {
    name: "Tailwind",
    icon: <RiTailwindCssFill size={"50px"} color="#06b6d4" />,
  },
  {
    name: "Webpack",
    icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/webpack/webpack-original.svg" width={50} height={50} alt="Webpack" />,
  },
  {
    name: "Rollup",
    icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rollup/rollup-original.svg" width={50} height={50} alt="Rollup" />,
  },
  {
    name: "Vite",
    icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" width={50} height={50} alt="Vite" />,
  },
  {
    name: "Node.js",
    icon: <FaNodeJs size={"50px"} color="#6cc24a" />,
  },
  {
    name: "Express",
    icon: <SiExpress size={"50px"} color="#fff" />,
  },
  {
    name: "NestJS",
    icon: <SiNestjs size={"50px"} color="#E0234E" />,
  },
  {
    name: "Electron",
    icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/electron/electron-original.svg" width={50} height={50} alt="electron" />,
  },
  {
    name: "MySQL",
    icon: <DiMysql size={"50px"} color="#336791" />,
  },
  {
    name: "MongoDB",
    icon: <DiMongodb size={"50px"} color="#4db33d" />,
  },
  {
    name: "Git",
    icon: <FaGit size={"50px"} color="#f05032" />,
  },
  {
    name: "Linux",
    icon: <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" width={50} height={50} alt="linux" />,
  }
]
function Page() {
  const [toolsLoaded, setToolsLoaded] = useState(false);
  useEffect(() => {
    setToolsLoaded(true);
  }, []);
  return (
    <div className="container mx-auto px-4 md:px-[50px] xl:px-[200px] text-zinc-300 pt-20 pb-20">
      <div className="flex flex-col lg:flex-row gap-5">
        <aside className="w-full md:basis-1/4">
          <div
            className="p-4 md:p-8 lg:p-10 rounded-2xl border-[.5px] border-zinc-600"
            style={{
              backdropFilter: "blur(2px)",
            }}
          >
            <div className="flex flex-row lg:flex-col items-center">
              <div className="flex justify-center items-center lg:w-full lg:aspect-square bg-zinc-800 rounded-xl lg:mb-5">
                <Image
                  className="rounded-full p-4 lg:p-10 w-[100px] md:w-[150px] lg:w-[200px] aspect-square  bg-zinc-800"
                  alt="me"
                  src="/assets/me.jpeg"
                  width={200}
                  height={200}
                />
              </div>
              <div className="flex flex-col gap-3 lg:items-center ml-10 md:ml-20 lg:ml-0">
                <p className="text-center text-xl font-sans">小天</p>
                <div className="text-xs bg-zinc-700 w-fit px-3 py-1 rounded-full">
                  Web Developer
                </div>
              </div>
            </div>
          </div>
        </aside>
        <main className="basis-3/4 w-[500px]">
          <div
            className="p-10 border-[.5px] rounded-md border-zinc-600"
            style={{ backdropFilter: "blur(2px)" }}
          >
            <h1 className="text-3xl mb-7 lg:md-20">关于我</h1>
            <p className="mb-10 text-roboto">
              一个正在学习和努力 Coding... 的菜鸡前端（全栈）开发。
              <Image src={'/assets/nyan-cat.gif'} unoptimized alt="nyan-cat" width={200} height={100} />
            </p>
            <h1 className="text-3xl mb-7 lg:md-20">I can use</h1>
            <div className="mb-5">
              {!toolsLoaded ? (
                <p className="h-[100px]"></p>
              ) : (
                <Splide
                  options={{
                    type: "loop",
                    interval: 2000,
                    autoplay: true,
                    pagination: false,
                    speed: 500,
                    perPage: 5,
                    perMove: 1,
                    rewind: true,
                    easing: "cubic-bezier(0.25, 1, 0.5, 1)",
                    arrows: false,
                  }}
                  aria-label="My Favorite Images"
                >
                  {TOOLS.reverse().map((tool) => (
                    <SplideSlide key={tool.name}>
                      <div
                        key={tool.name}
                        className="w-fit p-2 border-[.5px] border-zinc-600 rounded-md"
                      >
                        {tool.icon}
                      </div>
                    </SplideSlide>
                  ))}
                </Splide>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Page;
