import { PageProps } from "../../deps.ts";

type ModelsListProps = PageProps<{ models: string[] }>;

export default function ModelsList({ data }: ModelsListProps) {
  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-0 py-5 md:py-0">
      <h1 className="text-2xl mb-4">Models</h1>
      {data.models.map((model, index) => (
        <div key={index} className="mb-2">
          <a href={`/${model}`} className="text-blue-500 hover:underline">
            {model}
          </a>
        </div>
      ))}
    </div>
  );
}
