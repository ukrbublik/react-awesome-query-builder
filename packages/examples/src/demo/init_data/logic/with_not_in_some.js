export default 
{
  "and": [
    { "some": [
      { "var": "cars" },
      { "in": [ { "var": "vendor" }, [ "Ford", "Toyota" ] ] }
    ] },
    { "all": [
      { "var": "cars" },
      { "!": { "in": [ { "var": "vendor" }, [ "Ford", "Toyota" ] ] } }
    ] },
    { "all": [
      { "var": "cars" },
      { "!": { "and": [ { "!": { "in": [ { "var": "vendor" }, [ "Ford", "Toyota" ] ] } } ] } }
    ] },
    { "some": [
      { "var": "cars" },
      { "!": { "and": [ { "!": { "in": [ { "var": "vendor" }, [ "Ford", "Toyota" ] ] } } ] } }
    ] },
    { "some": [
      { "var": "cars" },
      { "!": { "!": { "in": [ { "var": "vendor" }, [ "Ford", "Toyota" ] ] } } }
    ] },
    { "some": [
      { "var": "cars" },
      { "!": { "!": { "!": { "in": [ { "var": "vendor" }, [ "Ford", "Toyota" ] ] } } } }
    ] }
  ]
};
