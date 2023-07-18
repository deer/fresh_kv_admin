import { PageProps } from "$fresh/server.ts";
import Item from "./Item.tsx";

type AllItemsProps = PageProps<{ items: any[]; modelName: string }>;

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
      <h1 className="text-2xl mb-4">{data.modelName}</h1>
      <a href={`/${data.modelName}/new`} className="text-blue-500 mb-4 block">
        Create new {data.modelName}
      </a>
      <button onClick={handleDeleteAll}>Delete All</button>
      {data.items.map((item, index) => (
        <div key={index}>
          <Item item={item} modelName={data.modelName} />
          <a href={`/${data.modelName}/${item.id}`} className="text-blue-500">
            View Item
          </a>
        </div>
      ))}
    </div>
  );
}
