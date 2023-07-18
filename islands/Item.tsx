import { PageProps } from "$fresh/server.ts";

type ItemProps = PageProps<{ item: { id: string }; modelName: string }> | {
  item: { id: string };
  modelName: string;
};

export default function Item(props: ItemProps) {
  const item = "data" in props ? props.data.item : props.item;
  const modelName = "data" in props ? props.data.modelName : props.modelName;
  const handleDelete = async () => {
    const response = await fetch(`/${modelName}/${item.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      console.error("Failed to delete item");
    } else {
      window.location.href = `/${modelName}`;
    }
  };
  return (
    <div className="border p-4 rounded mb-4 bg-gray-100">
      {Object.entries(item).map(([key, value]) => (
        <p key={key} className="mb-1">
          <strong className="mr-2">{key}:</strong> {JSON.stringify(value)}
        </p>
      ))}
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
