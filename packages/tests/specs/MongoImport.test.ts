import { expect } from "chai";
import { Utils } from "@react-awesome-query-builder/core";
import * as configs from "../support/configs";
import { with_qb } from "../support/utils";

const { simple_with_numbers_and_str } = configs;

describe("mongoDbImport", () => {
  it("should import simple equality", async () => {
    const mongoQuery = { num: 2 };
    await with_qb([simple_with_numbers_and_str], mongoQuery, "MongoDb", async (qb, {expect_checks}) => {
      await expect_checks({
        "mongo": mongoQuery,
      });
    });
  });

  it("should import $gt", async () => {
    const mongoQuery = { num: { $gt: 5 } };
    await with_qb([simple_with_numbers_and_str], mongoQuery, "MongoDb", async (qb, {expect_checks}) => {
      await expect_checks({
        "mongo": mongoQuery,
      });
    });
  });

  it("should import $and", async () => {
    const mongoQuery = { $and: [ { num: { $gt: 1 } }, { num: { $lt: 5 } } ] };
    await with_qb([simple_with_numbers_and_str], mongoQuery, "MongoDb", async (qb, {expect_checks}) => {
      await expect_checks({
        "mongo": {
          "num": {
            "$gt": 1,
            "$lt": 5
          }
        },
      });
    });
  });

  it("should import between", async () => {
    const mongoQuery = { num: { $gte: 1, $lte: 2 } };
    await with_qb([simple_with_numbers_and_str], mongoQuery, "MongoDb", async (qb, {expect_checks}) => {
      await expect_checks({
        "mongo": mongoQuery,
      });
    });
  });

  it("should import like (regex)", async () => {
    const mongoQuery = { str: { $regex: "foo" } };
    await with_qb([simple_with_numbers_and_str], mongoQuery, "MongoDb", async (qb, {expect_checks}) => {
      await expect_checks({
        "mongo": mongoQuery,
      });
    });
  });
});

