import { resolveCmsText } from './utils';
import assert from 'assert';

function testFallbackSemantics() {
  const fallback = "Default Hardcoded Text";

  // 1. Valid string -> Returns CMS string
  assert.strictEqual(resolveCmsText("CMS Value", fallback), "CMS Value", "Failed valid string");

  // 2. undefined/missing -> Returns fallback
  assert.strictEqual(resolveCmsText(undefined, fallback), fallback, "Failed undefined");

  // 3. null -> Returns fallback
  assert.strictEqual(resolveCmsText(null, fallback), fallback, "Failed null");

  // 4. "" (empty string) -> Returns "" (intentional deletion)
  assert.strictEqual(resolveCmsText("", fallback), "", "Failed empty string");

  // 5. Whitespace-only string -> Returns "" (intentional deletion)
  assert.strictEqual(resolveCmsText("   ", fallback), "", "Failed whitespace string");
  assert.strictEqual(resolveCmsText("\n\t ", fallback), "", "Failed newline/tab string");

  // 6. Invalid type (e.g. number accidentally passed) -> Returns fallback
  // @ts-expect-error - testing invalid JS types at runtime
  assert.strictEqual(resolveCmsText(123, fallback), fallback, "Failed invalid type");

  console.log("✅ All F-01 Fallback Semantic tests passed.");
}

testFallbackSemantics();
