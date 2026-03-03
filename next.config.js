/** @type {import('next').NextConfig} */

const host =
  process.env.NODE_ENV === "development"
    ? "siab-dev-t.s3.amazonaws.com"
    : "siab-prod-t.s3.amazonaws.com";

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "rc-util",
    "@ant-design",
    "kitchen-flow-editor",
    "@ant-design/pro-editor",
    "zustand",
    "leva",
    "antd",
    "rc-pagination",
    "rc-picker",
  ],
  env: {
    SERVER: process.env.SERVER,
  },
  images: {
    domains: [host, "solarsure.in"],
  },
  output: "standalone",
};

module.exports = nextConfig;
