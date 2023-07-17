import { PageProps } from "$fresh/server.ts";

type ModelsListProps = PageProps<{ realModels: string[] }>;

export default function ModelsList({ data }: ModelsListProps) {
  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-0 py-5 md:py-0">
      <h1 className="text-2xl mb-4">Models</h1>
      {data.realModels.map((model, index) => (
        <div key={index}>
          <a href={`/${model}`} className="text-blue-500">{model}</a>
        </div>
      ))}
    </div>
  );
}
