function main() {
    var adCustomizerSource = AdsApp.adCustomizerSources().withCondition('Name = "MyFeed"').get().next();

    var sundayAllDay = {
        dayOfWeek: "SUNDAY",
        startHour: 0,
        startMinute: 1,  
        endHour: 23,
        endMinute: 59
    };

    var otherDays = [
        { dayOfWeek: "MONDAY", startHour: 0, startMinute: 1, endHour: 23, endMinute: 59 },
        { dayOfWeek: "TUESDAY", startHour: 0, startMinute: 1, endHour: 23, endMinute: 59 },
        { dayOfWeek: "WEDNESDAY", startHour: 0, startMinute: 1, endHour: 23, endMinute: 59 },
        { dayOfWeek: "THURSDAY", startHour: 0, startMinute: 1, endHour: 23, endMinute: 59 },
        { dayOfWeek: "FRIDAY", startHour: 0, startMinute: 1, endHour: 23, endMinute: 59 },
        { dayOfWeek: "SATURDAY", startHour: 0, startMinute: 1, endHour: 23, endMinute: 59 },
    ];

    var campaignIterator = AdsApp.campaigns().withCondition("Name CONTAINS 'XYZ123'").get();

    while(campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();

    // Sunday text
    adCustomizerSource.adCustomizerItemBuilder()
        .withAttributeValues({
            Headline: "hello its sunday",
            Price: "2.99$"
        })
        .withTargetCampaign(campaign.getName())
        .withSchedules([sundayAllDay])
        .build();

    // Text for other days
    adCustomizerSource.adCustomizerItemBuilder()
        .withAttributeValues({
            Text: "hello its a weekday"
        })
        .withTargetCampaign(campaign.getName())
        .withSchedules(otherDays)
        .build();
    }
}

//usage : {=MyFeed.Headline} ...
// for only {=MyFeed.Price}