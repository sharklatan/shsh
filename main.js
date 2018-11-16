var button_processing = false;
var ecid;
var hw_platform;
var device_id;
var apnonce;
var version;
window.onload = function()
{
  ecid = document.getElementById('ecid');
  device_selection_changed();
};

function device_selection_changed()
{
  var selected_device = document.getElementById('device').value;
  change_signed_firmware_options(selected_device);
  var platform_options = document.getElementById('platform_select');
  var boardconfigs_for_device = platforms[selected_device];
  while(platform_options.options.length)
  {
    platform_options.remove(0);
  }
  for(var boardconfig_index in boardconfigs_for_device)
  {
    var option = document.createElement('option');
    option.value = boardconfigs_for_device[boardconfig_index];
    option.innerHTML = boardconfigs_for_device[boardconfig_index];
    platform_options.appendChild(option);
  }
  if(boardconfigs_for_device.length > 1)
  {
    document.getElementById('platform').style.display = null;
    document.getElementById('platform_text').style.display = null;
  }
  else
  {
    document.getElementById('platform').style.display = "none";
    document.getElementById('platform_text').style.display = "none";
  }
}

function change_signed_firmware_options(selected_device)
{
  var signed_versions = signed_array[selected_device];
  var version_options = document.getElementById('versions');
  while(version_options.options.length)
  {
    version_options.remove(0);
  }
  var new_options = [];
  var all_firmware_option = document.createElement('option');
  all_firmware_option.value = 'all';
  all_firmware_option.innerHTML = 'All Signed';
  version_options.appendChild(all_firmware_option);
  for(var key in signed_versions)
  {
    var new_option = document.createElement('option');
    new_option.value = key;
    new_option.innerHTML = signed_versions[key];
    new_options.push(new_option);
    version_options.appendChild(new_option);
  }
  // version_options.options = new_options;
}

function form_submit()
{
  if(button_processing)
  {
    return;
  }
  button_processing = true;
  var button = document.getElementById('main_button');
  var loader = document.getElementById('loader_in_submit_button');
  var status_text = document.getElementById('status_text');
  loader.style.display = 'block';
  status_text.style.display = 'block';
  button.childNodes[0].nodeValue = "Requesting APTicket";
  // button.disabled = true;
  if (validate_form_data() === false)
  {
    set_status_text("Invalid data entered");
    button.childNodes[0].nodeValue = "Request APTicket";
    toggle_visibility_for_id('loader_in_submit_button', false);
    button_processing = false;
    return;
  }

  var url = 'https://api.xninja.xyz/shsh3/t.php';
  var nR1 = new XMLHttpRequest();
  nR1.open("POST", url, true);
  nR1.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  set_status_text('Awaiting response');

  {
    button_processing = false;
    var device = document.getElementById('device').value;
    var platform = document.getElementById('platform_select').value;
    var firmware = document.getElementById('versions').value;
    var ecid_hex = ecid.value;

    var string = "".concat("device=", device, "&boardconfig=", platform, "&ecid=", ecid_hex);
    console.log(string);
    // return;
  }
  nR1.onreadystatechange = function ()
  {
    if(this.readyState === 4)
    {
      var response = JSON.parse(nR1.responseText);
      console.log(response);
      if(response['code'] === 0)
      {
        set_status_text('Saved succesfully');
        toggle_visibility_for_id('main_button', false);
        var links = '';
        var builds = response['builds'];
        for(var build in builds)
        {
          links += "<a href = '"+ builds[build]['url'] +"'>" + builds['version'] + " View yours SHSH</a><br>";
        }
        var links_text = document.getElementById('links_text');
        links_text.innerHTML = links;
        toggle_visibility_for_id('links_text', true);
      }
      else
      {
        set_status_text(response['message']);
        button_processing = false;
        button.childNodes[0].nodeValue = "Request APTicket";
      }
      toggle_visibility_for_id('loader_in_submit_button', false);
    }
  }
  nR1.send(string);
}


function validate_form_data()
{
  set_status_text("Validating input...");
  if(ecid.value.match(/\b[0-9A-Fa-f]{6,16}\b/) == null) return false;


}

function set_status_text(text)
{
  var status_text = document.getElementById('status_text');
  status_text.childNodes[0].nodeValue = text;
}

function toggle_visibility_for_id(id, show)
{
  var element = document.getElementById(id);
  element.style.display = show ? null : "none";
}
