export default
{
  "and": [
    {"!": {"and": [{"in": ["abc3", {"var": "user.firstName"}]}]}},
    {"!": {"in": ["xyz", {"var": "user.firstName"}]}},
    {"!": {"and": [{"<=": [1, {"var": "num"}, 2]}]}},
    {"!": {"<=": [3, {"var": "num"}, 4]}},
    {"!": {"and": [{"in": [{"var": "color"}, ["yellow"]]}]}},
    {"!": {"in": [{"var": "color"}, ["green"]]}},
    {"!": {"and": [{"all": [{"var": "multicolor"}, {"in": [{"var": ""}, ["yellow"]]}]}]}},
    {"!": {"all": [{"var": "multicolor"}, {"in": [{"var": ""}, ["yellow"]]}]}},
    {"!": {"and": [{"some": [{"var": "multicolor"}, {"in": [{"var": ""}, ["green"]]}]}]}},
    {"!": {"some": [{"var": "multicolor"}, {"in": [{"var": ""}, ["green"]]}]}},
    {"==": [{"var": "user.firstName"}, null]}
  ]
};
