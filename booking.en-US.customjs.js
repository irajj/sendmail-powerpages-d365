var FIELD_LOGICAL_NAME = 'rjdev_slots';
var ENTITY_NAME = 'rjdev_bookings';

// MODAL POP REQ.
const field1LogicalName = 'rjdev_name';
const field2LogicalName = 'rjdev_lastname';
const field3LogicalName = 'rjdev_located';
const field4LogicalName = 'rjdev_date_datepicker_description';
const optionSetLogicalName = 'rjdev_maintenanceandrepairnotice';

$(async function () {
    (function (webapi, $) {
        function safeAjax(ajaxOptions) {
            var deferredAjax = $.Deferred();
            shell
                .getTokenDeferred()
                .done(function (token) {
                    // add headers for AJAX
                    if (!ajaxOptions.headers) {
                        $.extend(ajaxOptions, {
                            headers: {
                                __RequestVerificationToken: token,
                            },
                        });
                    } else {
                        ajaxOptions.headers["__RequestVerificationToken"] = token;
                    }
                    $.ajax(ajaxOptions)
                        .done(function (data, textStatus, jqXHR) {
                            validateLoginSession(
                                data,
                                textStatus,
                                jqXHR,
                                deferredAjax.resolve
                            );
                        })
                        .fail(deferredAjax.reject); //AJAX
                })
                .fail(function () {
                    deferredAjax.rejectWith(this, arguments); // on token failure pass the token AJAX and args
                });
            return deferredAjax.promise();
        }
        webapi.safeAjax = safeAjax;
    })((window.webapi = window.webapi || {}), jQuery);
})

$(document).ready(function () {
    addCustomValidator()

    const $fieldBooking = $(`#${FIELD_LOGICAL_NAME}`);
    $fieldBooking.on('change', getCountOfSelectedSlot);

    // NEW REQ T AND C
    const $fieldTandC = $(`#${optionSetLogicalName}`);
    $fieldTandC.on('change', optionModalPopUp);
});

// NEW RQ
function optionModalPopUp() {

    $('.customarow').remove();
    const $rowToBindLink = $(`#${optionSetLogicalName}`)

    const newRowLink = `<div id="customdiv" class="customarow" style="position: relative;top: 5px;left: 3px;color: blue;text-decoration: underline;margin-top:35px;"><span onlick="customatag"><a onclick="IdentifyModalPopUp()">Open Term & Condition </a></span></td></tr>`;
    $rowToBindLink.parents().eq(2).children().eq(1).children().eq(1).after(newRowLink);
}

// NEW RQ
function IdentifyModalPopUp() {

    let selectedOptionVal = $(`#${optionSetLogicalName}`).val()

    const OPTIONSET_TO_WORD = {
        "708290000": "myModal1",
        "708290001": "myModal2",
        "708290002": "myModal3",
        "708290003": "myModal4",
    }

    let modalNumber = OPTIONSET_TO_WORD[selectedOptionVal][OPTIONSET_TO_WORD[selectedOptionVal].length - 1];
    let modalDiv = document.getElementById(OPTIONSET_TO_WORD[selectedOptionVal])
    // get FIELD VALUE
    const field4Value = $(`#${field4LogicalName}`).val(); //Date vala
    const field1Value = $(`#${field1LogicalName}`).val(); // First Name
    const field2Value = $(`#${field2LogicalName}`).val(); // Last Name
    const field3Value = $(`#${field3LogicalName}`).val(); // Located
    for (let i = 1; i <= 4; i++) {
        $(`#field${i}modal${modalNumber}`).text(i == 1 ? field4Value : i == 2 ? field1Value : i == 3 ? field2Value : i == 4 ? field3Value : '')
    }

    modalDiv.style.display = 'block';
    let getCloseButton = document.getElementById(`close${modalNumber}`);
    getCloseButton.addEventListener('click', function () { modalDiv.style.display = 'none'; })

    let getCheckBox = document.getElementById(`checkbox1modal${modalNumber}`);
    addCustomValidator()

}

// NEW RQ
function handleClickTandC(cb) {

    if (cb.checked) {
        let number = cb.value;
        top.selectednumber = number;
        top.appliedtandc = true
        debugger


    }
    if (!cb.checked) { top.appliedtandc = false }

}

async function getCountOfSelectedSlot(target) {
    $('.customcountrow').remove();
    const $getBookingField = target.target;
    const $selectedText = $($getBookingField).find(":selected").text();
    const $selectedValue = $($getBookingField).find(":selected").val();
    if ($selectedValue != "") {

        const slotCount = await getCount($selectedValue);
        const $rowToBind = $(`#${FIELD_LOGICAL_NAME}`)
        const newRow = `<tr><td style="padding-left: 31px;" class="clearfix cell picklist-cell customcountrow"><span id="count">${slotCount <= 10 ? `Available` : 'Not Available'}</span></td></tr>`;
        $rowToBind.parents().eq(2).after(newRow);

        addCustomValidator();


    }
    else {
        $('.customcountrow').remove();

    }

}

async function getCount(value) {
    return new Promise((resolve, reject) => {
        webapi.safeAjax({
            type: "GET",
            url: `/_api/${ENTITY_NAME}?$filter=${FIELD_LOGICAL_NAME} eq ${value}`,
            contentType: "application/json",
            headers: {
                "Prefer": "odata.include-annotations=*"
            },
            success: function (data, textStatus, xhr) {
                ;
                if (data) {
                    resolve(data.value.length);
                } else {
                    resolve(0);
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                ;
                console.log(xhr);
                alert('something went wrong');
                reject(errorThrown);
            }
        });
    });

}

function addCustomValidator() {

    const inserButton = document.getElementById('InsertButton');
    inserButton.setAttribute('onclick', '');
    inserButton.setAttribute('onclick', `javascript:(async function() {

    var countElement = $('#count');
    if (countElement.length) {
        var countValue = parseInt(countElement.text().replace('Count: ', ''));
        if (countValue >= 10) {
            alert('Count is greater than 10. Form submission prevented.');
            return false;
        }
    }

    if (!top.appliedtandc) {
        alert('please apply term and condition before submit');
        return false;
    }

    if (top.appliedtandc) {
        debugger;
        await sendPDF();
    }

    if (typeof entityFormClientValidate === 'function') {
        if (entityFormClientValidate()) {
            if (typeof Page_ClientValidate === 'function') {
                if (Page_ClientValidate('')) {
                    clearIsDirty();
                    disableButtons();
                    this.value = 'Processing...';
                }
            } else {
                clearIsDirty();
                disableButtons();
                this.value = 'Processing...';
            }
        } else {
            return false;
        }
    } else {
        if (typeof Page_ClientValidate === 'function') {
            if (Page_ClientValidate('')) {
                clearIsDirty();
                disableButtons();
                this.value = 'Processing...';
            }
        } else {
            clearIsDirty();
            disableButtons();
            this.value = 'Processing...';
        }
    }
    WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions('ctl00$ContentContainer$EntityFormControl_3463c89eac8e4cf4a1850e8999d716df$InsertButton', '', true, '', '', false, true));
})()`)
};

async function sendPDF() {
    // Select the element to convert
    const element = document.getElementById(`pdf${top.selectednumber}`);

    // Set the options for the PDF generation
    const opt = {
        margin: 1,
        filename: 'Consent_and_Release_Form.pdf',
        image: { type: 'jpeg', quality: 3 },
        html2canvas: { scale: 3 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Generate the PDF and save it
    await html2pdf().from(element).set(opt).save();

    // Generate the PDF and get the base64 string
    const pdfAsString = await html2pdf().set(opt).from(element).output('datauristring');

    // Display the base64 string
    debugger;
    let pdffullstring = pdfAsString
    let pdfbase64 = pdfAsString.split(',')[1];
    top.datatosend = {}
    top.datatosend.pdffullstring = pdffullstring;
    top.datatosend.pdfbase64 = pdfbase64;
    top.datatosend.email = 'irajjsharma@gmail.com';
    debugger
    const myApiResult = await fetch('https://prod2-24.centralindia.logic.azure.com:443/workflows/c35c3dd2f68d4bc3927939596179d5dc/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=bnpxtnkHPnyFx30cWX4GSojH-ytl4dwneGneoCYJ8bs', {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(top.datatosend),
    });
    const result = await myApiResult.json();
    debugger


}