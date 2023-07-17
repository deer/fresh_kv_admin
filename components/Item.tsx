import { PageProps } from "$fresh/server.ts";

type ItemProps = PageProps<{ item: any }> | { item: any };

export default function Item(props: ItemProps) {
  const item = "data" in props ? props.data.item : props.item;
  return (
    <div className="border p-4 rounded mb-4 bg-gray-100">
      {Object.entries(item).map(([key, value]) => (
        <p key={key} className="mb-1">
          <strong className="mr-2">{key}:</strong> {JSON.stringify(value)}
        </p>
      ))}
    </div>
  );
}
