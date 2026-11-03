const suiteImages = import.meta.glob<string>("../../assets/suites/*.{jpg,jpeg,png,webp,avif}", {
  eager: true,
  query: "?url",
  import: "default",
});

const imagesBySuiteId = Object.entries(suiteImages).reduce<Record<string, string>>((images, [path, url]) => {
  const filename = path.split("/").pop() ?? "";
  const suiteId = filename.replace(/\.(jpe?g|png|webp|avif)$/i, "").toUpperCase();
  images[suiteId] = url;
  return images;
}, {});

export function getSuiteImage(suiteId: string, fallback = "") {
  return imagesBySuiteId[suiteId.toUpperCase()] || fallback;
}
