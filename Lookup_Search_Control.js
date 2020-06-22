
//entityname        ------>   Lookup Field's Entity Name
//entityId          ------>   PrimaryField name of Lookup Field's Entity Name 
//entitysetname     ------>   OData Feeds Entity Set Name (Entity List that you have been created for OData Feeds)
//fieldtosearch     ------>  'Field Name' that you want to search in Lookup Field.
//lookupname        ------>  'Lookup Field Name Id' on which you are enabling Search feature. (<input id="lookupfieldname_name"></input>)
//lookupId          ------>  'Lookup Field Id' on which you are enabling Search feature. (<input id="lookupfieldname"></input>)
//lookuppentityname ------>  'Lookup Field Entity Name Id' on which you are enabling Search feature. (<input id="lookupfieldname_entityname"></input>)
//loggedInUser      ------>  'Guid' of Portal Logged In User.
//ContactFieldName  ------>  'Field Name' of Lookup Field's Entity in which you are storing Contact Name.

function ApplyLookupSearch(entityname, entityId, entitysetname, fieldtosearch, lookupname, lookupId, lookuppentityname, filterByContactorAccount, ContactOrAccountFieldName) {
    try {
        if (entityname == null || entityId == null || entitysetname == null || fieldtosearch == null || lookupname == null || lookupId == null || lookuppentityname == null) {

            alert("Insufficient parameters supplied to the <ApplyLookupSearch>");
            return false;
        }

        var lookupname_Id = "#" + lookupname;
        var lookup_Id = "#" + lookupId;
        var lookupentityname_Id = "#" + lookuppentityname;
        var triggerAutocompleteBox = "input" + lookupname_Id;
        // jQuery
        $.getScript('https://code.jquery.com/jquery-1.12.4.js', function () {

            $.getScript('https://code.jquery.com/ui/1.12.1/jquery-ui.js', function () {

                $('head').append('<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css" />');
                $('head').append(' <link rel="stylesheet" href="/resources/demos/style.css" />');
                $(function () {


                    $(lookupname_Id).removeAttr('readonly');
                    $(lookupname_Id).keydown(function (e) {

                        if ($(lookupname_Id).val() == '') {
                            $(lookupname_Id).css('color', 'black');
                        }

                        if (e.which == 9) {

                            localStorage.clear();

                            var userInput = this.value;

                            var query;

                            // Search without logged In user Filter
                            if (filterByContactorAccount == null && ContactOrAccountFieldName == null) {

                                query = "~/_odata/" + entitysetname + "/?$filter=substringof(%27" + userInput + "%27," + fieldtosearch + ")";
                            }

                            // Search based on logged In user Filter
                            if (filterByContactorAccount != null && ContactOrAccountFieldName != null) {

                                query = "~/_odata/cases/?$filter=" + ContactOrAccountFieldName + "/Id%20eq%20(guid%27" + filterByContactorAccount + "%27) and substringof(%27" + userInput + "%27," + fieldtosearch + ")";

                            }

                            var fillData = [];

                            $.ajax({
                                type: "GET",
                                url: query,
                                dataType: 'json',
                                Async: false,
                            }).done(function (json) {

                                var dataCollection = json.value;

                                if (dataCollection.length == 0) {

                                    $(lookupname_Id).val('✖ ' + $(lookupname_Id).val());
                                    $(lookupname_Id).css('color', 'red');

                                    return false;
                                }

                                var count = 0;
                                var cacheCounter = 0;


                                $.each(dataCollection, function (index, coll) {

                                    if (count < 10) {

                                        if (coll[fieldtosearch]) {
                                            fillData.push(coll[fieldtosearch]);
                                            localStorage.setItem(cacheCounter, coll[entityId]);
                                            cacheCounter++;
                                        }

                                        count++
                                    }

                                });

                                $(triggerAutocompleteBox).autocomplete("search");


                            })
                            .fail(function (xhr, status, error) {
                                alert("Search Failed : Unable to retrieve data due to Invalid paramater supplied to <ApplyLookupSearch>.");
                            });

                            $(lookupname_Id).autocomplete({
                                source: fillData,


                                select: function (event, ui) {

                                    var selectedIndex = $.inArray(ui.item.value, fillData);
                                    var label = ui.item.label;

                                    var selectedText = ui.item.label;
                                    var selectedValue = localStorage.getItem(selectedIndex);

                                    $(lookupname_Id).val(selectedText);
                                    $(lookup_Id).val(selectedValue);
                                    $(lookupentityname_Id).val(entityname);

                                }
                            });
                        }

                    });

                });

            });
        });

    }

    catch (err) {
        alert(err.message);
    }
}
