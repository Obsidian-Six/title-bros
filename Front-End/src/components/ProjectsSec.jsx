"use client";

import { useEffect, useState } from "react";
import Reveal from "./Reveal";
import { projectService } from "@/services/projectService";
import { getDocumentUrl } from "@/services/loanService";

export default function ProjectsSec() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectService.getProjects();
        if (res && res.data) {
          setProjects(res.data);
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading || projects.length === 0) {
    return null; // Don't show the section if no projects or still loading
  }

  return (
    <section className="section bg-[var(--white)]">
      <div className="container-x">
        <Reveal>
          <div className="eyebrow text-[var(--muted)] before:bg-[var(--green)]">
            Our Projects
          </div>
          <h2 className="h2 mt-6 max-w-4xl text-[var(--ink)]">
            Media & <span className="text-[var(--green)]">Showcase</span>
          </h2>
          <p className="mt-4 max-w-2xl text-[var(--muted)]">
            Take a look at some of our recent projects and media highlights.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal key={project._id} delay={i * 0.07}>
              <div className="card group h-full overflow-hidden transition duration-500 hover:-translate-y-2 hover:shadow-2xl!">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  <img
                    src={getDocumentUrl(project.mediaUrl)}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="text-xl font-bold text-[var(--ink)]">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="mt-3 text-sm text-[var(--muted)] line-clamp-3">
                      {project.description}
                    </p>
                  )}
                  {project.tags && project.tags.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[var(--green)]/10 px-3 py-1 text-xs font-bold text-[var(--green-dark)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
