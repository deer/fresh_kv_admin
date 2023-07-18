import { PageProps } from "$fresh/server.ts";
import { ZodObject, ZodRawShape } from "z";

type FormProps = PageProps<
  { schema: ZodObject<ZodRawShape>; modelName: string }
>;

export default function Form(props: FormProps) {
  const schema = props.data.schema;
  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-0 py-5 md:py-4">
      <form method="post" action={`/${props.data.modelName}`}>
        {Object.keys(schema.shape).map((key) => (
          <div key={key} className="mb-2">
            <label className="block mb-1">{key}</label>
            <input
              name={key}
              defaultValue={""}
              className="border p-2 rounded w-full"
            />
          </div>
        ))}
        <button
          type="submit"
          className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
