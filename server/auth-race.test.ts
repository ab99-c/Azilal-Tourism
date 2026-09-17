import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const localAuthSource = readFileSync(
  new URL("../client/src/components/LocalAuthDialog.tsx", import.meta.url),
  "utf8"
);
const useAuthSource = readFileSync(
  new URL("../client/src/_core/hooks/useAuth.ts", import.meta.url),
  "utf8"
);

describe("local auth modal race protection", () => {
  it("refreshes the me query and closes after a successful setData", () => {
    const finishBlock = localAuthSource.match(
      /const finish = async \(user: any\) => \{[\s\S]*?\n  \};/
    )?.[0];

    expect(finishBlock).toBeTruthy();
    expect(finishBlock).toContain("utils.auth.me.setData(undefined, user)");
    expect(finishBlock).toContain("utils.auth.me.invalidate()");
    expect(finishBlock).toContain("setOpen(false)");
  });

  it("guards unauthenticated redirects while the me query is fetching", () => {
    expect(useAuthSource).toContain(
      "if (meQuery.isLoading || meQuery.isFetching || logoutMutation.isPending) return;"
    );
    expect(useAuthSource).toContain("meQuery.isFetching,");
  });
});
