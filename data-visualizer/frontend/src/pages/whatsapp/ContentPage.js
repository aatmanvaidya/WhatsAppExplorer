import { useEffect, useState } from "react";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { isMobile } from "react-device-detect";
import { Grid } from "@mui/material";
import DataCard from "../../components/dataCard/DataCard";
import PopupContentBox from "../../components/popupContentBox/PopupContentBox";
import constants from "../../assets/constants";
import isAuth, { userType } from "../../lib/isAuth";
import IconButton from '@mui/material/IconButton';
// Import other components like TextField, Button, etc.
import ClearIcon from '@mui/icons-material/Clear';
import { useCallback } from "react";
const urls = {
  images: `${constants.apiBaseUrl}/images`,
  videos: `${constants.apiBaseUrl}/videos`,
  messages: `${constants.apiBaseUrl}/messages`,
  links: `${constants.apiBaseUrl}/links`,
  forwarded: `${constants.apiBaseUrl}/forwarded`
};

const ContentPage = ({ category,  setSyncTime }) => {
  const [data, setData] = useState([]);
  const [modalData, setModalData] = useState();
  // const [flagData, setFlagData] = useState([]);
  const [currentActiveIndex, setCurrentActiveIndex] = useState(-1);

  const [contentCount, setContentCount] = useState(0);
  const [contentCountLoaded, setContentCountLoaded] = useState(false);
  const [dataLoader, setDataLoader] = useState(true);

  const [skipOffset, setSkipOffset] = useState(0);
  const [finished, setFinished] = useState(false);

  const [filterInput, setFilterInput] = useState({
    searchText: "",
    minDate: null,
    maxDate: null,
  });

  const [filter, setFilter] = useState({
    searchText: "",
    minDate: null,
    maxDate: null,
  });

 

  const fetchContentCount = useCallback(async () => {
    let query = `${urls[category]}/getcount?skip=${skipOffset}&dateMin=${
      filter.minDate ? filter.minDate.toISOString() : ""
    }&dateMax=${filter.maxDate ? filter.maxDate.toISOString() : ""}&search=${filter.searchText}`;
    console.log(query);
    axios
      .get(query, {
        headers: {
          Authorization: `Bearer ${isAuth()}`,
        },
      })
      .then((response) => {
        setContentCount(response.data)
        setContentCountLoaded(true);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [filter,skipOffset,category]);

  let cnt = 0;

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
    setModalData();
  };
 
  const fetchData = async (reset) => {
    // let tmpFlagData = flagData;
    // if (cnt == 0) {
    //   try {
    //     const res = await axios.get(`${constants.apiBaseUrl}/flags`, {
    //       headers: {
    //         Authorization: `Bearer ${isAuth()}`,
    //       },
    //     });
    //     const { data } = await res;
    //     setFlagData(data);
    //     console.log(data);
    //     tmpFlagData = data;
    //   } catch (e) {
    //     console.log(e);
    //   }
    // }
    cnt = 1;

    let skipOffsetTemp = skipOffset;
    let dataTemp = [...data];
    if (reset) {
      setData([]);
      setFinished(false);
      setSkipOffset(0);
      skipOffsetTemp = 0;
      dataTemp = [];
    }
    let query = `${urls[category]}?skip=${skipOffsetTemp}&dateMin=${
      filter.minDate ? filter.minDate.toISOString() : ""
    }&dateMax=${filter.maxDate ? filter.maxDate.toISOString() : ""}&search=${filter.searchText}`;
    console.log(query);
    axios
      .get(query, {
        headers: {
          Authorization: `Bearer ${isAuth()}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        // for (let i in response.data) {
        //   for (let j in tmpFlagData) {
        //     console.log(tmpFlagData[j]);
        //     console.log(response.data[i]);
        //     console.log("----");
        //     if (tmpFlagData[j].contentId == response.data[i].id) {
        //       response.data[i]["isFlagged"] = true;
        //       response.data[i]["flagMessage"] = tmpFlagData[j]["message"];
        //       break;
        //     }
        //   }
        // }
        // console.log(response.data);
        setData([...dataTemp, ...response.data]);
        setDataLoader(false);
        if (response.data.length == 0) setFinished(true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // const fetchFlags = async () => {
  //   console.log(`${constants.apiBaseUrl}/flags`);
  //   try {
  //     const res = await axios.get(`${constants.apiBaseUrl}/flags`, {
  //       headers: {
  //         Authorization: `Bearer ${isAuth()}`,
  //       },
  //     });
  //     const { data } = await res;
  //     setFlagData(data);
  //     console.log(data);
  //     return data;
  //   } catch (e) {
  //     console.log(e);
  //   }
  //   return [];
  //   // axios
  //   //   .get(`${constants.apiBaseUrl}/flags`, {
  //   //     headers: {
  //   //       Authorization: `Bearer ${isAuth()}`,
  //   //     },
  //   //   })
  //   //   .then((response) => {
  //   //     setFlagData(response.data);
  //   //     console.log(response.data);
  //   //   })
  //   //   .catch((error) => {
  //   //     console.log(error);
  //   //   });
  // };

  // useEffect(() => fetchFlags(), []); // future fix: merge this with loader animation

  useEffect(() => {
    fetchData(false);
  }, [skipOffset]);

  useEffect(() => {
    fetchData(true);
  }, [filter]);


  // useEffect(() => {
  //   fetchMetaData();
  // }, [mdSkipOffset]);

  useEffect(() => {
    const query = `${constants.apiBaseUrl}/misc/latestMessageTimestamp`
    axios
      .get(query, {
        headers: {
          Authorization: `Bearer ${isAuth()}`,
        },
      })
      .then((response) => {
        if(response.data){
          setSyncTime(response.data["latestTimestamp"])
        }
      })
      .catch((error) => {
        console.log(error);
      });
    setContentCountLoaded(false);
    fetchContentCount();
  }, [fetchContentCount,filter])

  const handleScroll = (e) => {
    const { offsetHeight, scrollTop, scrollHeight } = e.target;
    if (!finished && offsetHeight + scrollTop >= scrollHeight) {
      setDataLoader(true);
      setSkipOffset(data.length);
    }
  };

  return (
    <>
      <div style={{
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}>
       <div
  style={{
    display: "flex",
    justifyContent: "center",
    paddingBottom: "20px",
  }}
>
  <Grid container spacing={2} style={{ maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
    {/* Search Text Field */}
    <Grid item xs={12} sm={4} md={3}>
      <TextField
        fullWidth
        label="Search Text"
        value={filterInput.searchText}
        onChange={(e) => setFilterInput({ ...filterInput, searchText: e.target.value })}
        InputProps={{
          endAdornment: (
            filterInput.searchText && <IconButton
              aria-label="clear text"
              onClick={() => setFilterInput({ ...filterInput, searchText: '' })}
              edge="end"
            >
              <ClearIcon />
            </IconButton>
          ),
        }}
        variant="outlined"
        size="small"
        disabled={dataLoader}
      />
    </Grid>

    {/* Start Date Picker */}
    <Grid item xs={6} sm={4} md={3}>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <DesktopDatePicker
          label="Start Date"
          value={filterInput.minDate}
          onChange={(newValue) => {
            newValue.set({
              hour: 0,
              minute: 0,
              second: 0,
              millisecond: 0,
            });
            setFilterInput({ ...filterInput, minDate: newValue });
          }}
          renderInput={(params) => (
            <TextField {...params} fullWidth variant="outlined" size="small" />
          )}
          inputFormat="DD/MM/yyyy"
          disabled={dataLoader}
        />
      </LocalizationProvider>
    </Grid>

    {/* End Date Picker */}
    <Grid item xs={6} sm={4} md={3}>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <DesktopDatePicker
          label="End Date"
          value={filterInput.maxDate}
          onChange={(newValue) => {
            newValue.set({
              hour: 23,
              minute: 59,
              second: 59,
              millisecond: 999,
            });
            setFilterInput({ ...filterInput, maxDate: newValue });
          }}
          renderInput={(params) => (
            <TextField {...params} fullWidth variant="outlined" size="small" />
          )}
          inputFormat="DD/MM/yyyy"
          disabled={dataLoader}
        />
      </LocalizationProvider>
    </Grid>

    {/* Apply Filter Button */}
    <Grid item xs={6} sm={4} md={1.5}>
      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={() => {
          setDataLoader(true);
          setFilter({ ...filterInput });
        }}
        disabled={dataLoader}
        size="large"
        style={{ height: '100%' }}
      >
        Search
      </Button>
    </Grid>

    {/* Reset Button */}
    <Grid item xs={6} sm={4} md={1.5}>
      <Button
        fullWidth
        variant="contained"
        onClick={() => {
          setFilterInput({
            searchText: "",
            minDate: null,
            maxDate: null,
          });
          setFilter({
            searchText: "",
            minDate: null,
            maxDate: null,
          });
        }}
        disabled={dataLoader}
        size="large"
        style={{ height: '100%', backgroundColor: "rgb(32, 222, 211)" }}
      >
        Reset
      </Button>
    </Grid>
  </Grid>
</div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            overflow: "auto",
            // height: isMobile ? "60vh" : "69vh",
            position: "relative",
          }}
          onScroll={handleScroll}
        >
          {data.length == 0 && !dataLoader && (
            <div style={{ padding: "40px" }}>No data found</div>
          )}
          {data.map((ele, index) => (
            <DataCard
              metadata={ele}
              onClick={() => {
                console.log(ele);
                setModalData({ ...ele});
                setCurrentActiveIndex(index);
                setOpen(true);
              }}
              category={category}
            />
          ))}
          {dataLoader && <CircularProgress style={{ padding: "20px 40vw" }} />}
        </div>

        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "15px",
            boxSizing: "border-box",
            flex: 1
          }}>
          {contentCountLoaded && `${dataLoader ? "Processing" : `Processed ${data.length}`} results from ${contentCount.toLocaleString()} ${category!="forwarded" ? category : "items"}`}
          {contentCountLoaded && !dataLoader && !finished && <Button
            variant="outlined"
            onClick={() => {
              setDataLoader(true);
              setSkipOffset(data.length);
            }}
            disabled={dataLoader}
            sx={{ margin: "0 5px" }}
          >
            Load More
          </Button>}
          {
            finished && ". Loaded all results."
          }
        </div>
      </div>

      <Modal open={open} onClose={handleClose}>
        {modalData && (
          <PopupContentBox
            category={modalData.contentType ? `${modalData.contentType}s` : category}
            modalData={modalData}
            handleClose={handleClose}
            isOpen={open}
            setData={setData}
            setModalData={setModalData}
            currentActiveIndex={currentActiveIndex}
            filter={filter}
            isForwarded={category=="forwarded"}
          />
        )}
      </Modal>
    </>
  );
};

export default ContentPage;
