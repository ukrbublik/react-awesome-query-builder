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

  it("should import $or with 2 rules", async () => {
    const mongoQuery = {
      "$or": [
        { "num": {"$lt": 2} },
        { "str": "ukrbublik" }
      ]
    };
    await with_qb([simple_with_numbers_and_str], mongoQuery, "MongoDb", async (qb, {expect_checks}) => {
      await expect_checks({
        "mongo": mongoQuery,
      });
    });
  });

  it("should import $nor (negated OR)", async () => {
    const mongoQuery = {
      "$nor": [{
        "$or": [
          {
            "num": {
              "$lt": 2
            }
          },
          {
            "str": "ukrbublik"
          }
        ]
      }]
    };
    await with_qb([simple_with_numbers_and_str], mongoQuery, "MongoDb", async (qb, {expect_checks}) => {
      await expect_checks({
        "mongo": mongoQuery,
      });
    });
  });

  it("should import nested AND/OR", async () => {
    const mongoQuery = {
      "$and": [
        { "num": { "$gt": 0 } },
        {
          "$or": [
            { "num": { "$lt": 3 } },
            { "str": "test" }
          ]
        }
      ]
    };
    await with_qb([simple_with_numbers_and_str], mongoQuery, "MongoDb", async (qb, {expect_checks}) => {
      await expect_checks({
        "mongo": mongoQuery,
      });
    });
  });

  it("should import deeply nested groups", async () => {
    const mongoQuery = {
      "$or": [
        {
          "$and": [
            { "num": { "$gte": 1 } },
            { "num": { "$lte": 5 } }
          ]
        },
        {
          "$and": [
            { "str": { "$regex": "test" } },
            { "num": { "$gt": 3 } }
          ]
        }
      ]
    };
    await with_qb([simple_with_numbers_and_str], mongoQuery, "MongoDb", async (qb, {expect_checks}) => {
      await expect_checks({
        "mongo": mongoQuery,
      });
    });
  });

  it("should import multiple fields as implicit AND", async () => {
    const mongoQuery = {
      "num": { "$gt": 2 },
      "str": "test"
    };
    await with_qb([simple_with_numbers_and_str], mongoQuery, "MongoDb", async (qb, {expect_checks}) => {
      await expect_checks({
        "mongo": mongoQuery,
      });
    });
  });

  it("should import complex nested structure with NOT", async () => {
    const mongoQuery = {
      "$and": [
        { "num": { "$gte": 0 } },
        {
          "$nor": [{
            "$or": [
              { "str": "exclude" },
              { "num": { "$gt": 4 } }
            ]
          }]
        }
      ]
    };
    await with_qb([simple_with_numbers_and_str], mongoQuery, "MongoDb", async (qb, {expect_checks}) => {
      await expect_checks({
        "mongo": mongoQuery,
      });
    });
  });

  it("should import triple nested groups", async () => {
    const mongoQuery = {
      "$or": [
        {
          "$and": [
            { "num": { "$lt": 3 } },
            {
              "$or": [
                { "str": "inner1" },
                { "str": "inner2" }
              ]
            }
          ]
        },
        { "num": { "$gt": 4 } }
      ]
    };
    await with_qb([simple_with_numbers_and_str], mongoQuery, "MongoDb", async (qb, {expect_checks}) => {
      await expect_checks({
        "mongo": mongoQuery,
      });
    });
  });
});

