import { PageProps } from "../../deps.ts";
import Item from "./Item.tsx";

type AllItemsProps = PageProps<{ items: { id: string }[]; modelName: string }>;

export default function AllItems({ data }: AllItemsProps) {
  const handleDeleteAll = async () => {
    const response = await fetch(`/${data.modelName}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      console.error("Failed to delete all items");
    } else {
      window.location.reload();
    }
  };
  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-0 py-5 md:py-0">
      <a href="/models" className="text-blue-500 mb-4 block hover:underline">
        Back to all models
      </a>
      <h1 className="text-2xl mb-4">{data.modelName}</h1>
      <a
        href={`/${data.modelName}/new`}
        className="text-blue-500 mb-4 block hover:underline"
      >
        Create new {data.modelName}
      </a>
      <button
        id="delete-all-button"
        onClick={handleDeleteAll}
        className="mb-4 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
      >
        Delete All
      </button>
      {data.items.map((item, index) => (
        <div key={index} className="mb-4">
          <Item item={item} modelName={data.modelName} standalone={false} />
        </div>
      ))}
    </div>
  );
}
