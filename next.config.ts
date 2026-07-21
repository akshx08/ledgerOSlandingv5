import type { NextConfig } from "next";

/*
 * `process.cwd()` rather than `__dirname`: this config is loaded as an ES
 * module in some Next/Node combinations where `__dirname` is undefined — a
 * hazard that never shows up locally but takes deployments down. Pinned at
 * all because the checkout sits beside sibling lockfiles from earlier builds.
 */
const nextConfig: NextConfig = { turbopack: { root: process.cwd() } };

export default nextConfig;
