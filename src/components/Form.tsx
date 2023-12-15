import { PageProps } from "../../deps.ts";
import {
  ZodDate,
  ZodObject,
  ZodRawShape,
  ZodString,
  ZodTypeAny,
} from "../../deps.ts";
import { uuid } from "../../deps.ts";

type FormProps = PageProps<
  { schema: ZodObject<ZodRawShape>; modelName: string }
>;

export default function Form(props: FormProps) {
  const schema = props.data.schema;
  const generateValue = (key: string, value: ZodTypeAny): string => {
    if (value instanceof ZodString && value.isUUID) {
      return uuid.v1.generate() as string;
    } else if (value instanceof ZodDate) {
      return new Date().toISOString();
    }
    return "";
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-0 py-5 md:py-0">
      <h1 className="text-2xl mb-4">Create new {props.data.modelName}</h1>
      <form
        method="post"
        action={`/${props.data.modelName}`}
        className="max-w-screen-lg"
      >
        {Object.entries(schema.shape).map(([key, value]) => (
          <div key={key} className="mb-4">
            <label className="block mb-2">{key}</label>
            <input
              name={key}
              defaultValue={generateValue(key, value)}
              className="border p-2 rounded w-full text-black"
            />
          </div>
        ))}
        <button
          type="submit"
          className="px-4 py-2 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
