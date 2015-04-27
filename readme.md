# README

One of the key differences over static webpages is that the meteor api is not ammenable to javscript scripts running rampant
on your main HTML (even inside templates). As such, this is an experiment to understand how to render things easily using meteor.

Namely, the first step is to dump the javascript into the Template.<name>.rendered function.

The next step will be to nail down reactivity, as well as move from hardcoded data to reactive datastore in the DB.
