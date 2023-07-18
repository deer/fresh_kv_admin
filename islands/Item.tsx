import { PageProps } from "$fresh/server.ts";

type ItemProps =
  | PageProps<{ item: { id: string }; modelName: string; standalone?: boolean }>
  | {
    item: { id: string };
    modelName: string;
    standalone?: boolean;
  };

export default function Item(props: ItemProps) {
  const item = "data" in props ? props.data.item : props.item;
  const modelName = "data" in props ? props.data.modelName : props.modelName;
  const standalone = "data" in props ? props.data.standalone : props.standalone;

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
      {standalone && (
        <a
          href={`/${modelName}`}
          className="text-blue-500 mb-4 block hover:underline"
        >
          Back to all {modelName}
        </a>
      )}
      {Object.entries(item).map(([key, value]) => (
        <p key={key} className="mb-1">
          <strong className="mr-2">{key}:</strong> {key === "id" && !standalone
            ? (
              <a
                href={`/${modelName}/${value}`}
                className="text-blue-500 hover:underline"
              >
                {JSON.stringify(value)}
              </a>
            )
            : (
              JSON.stringify(value)
            )}
        </p>
      ))}
      <button
        onClick={handleDelete}
        className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
      >
        Delete
      </button>
    </div>
  );
}
