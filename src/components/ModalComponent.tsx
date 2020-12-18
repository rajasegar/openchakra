import React from 'react'
import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
  List,
  ListItem,
  Spinner,
  ModalFooter,
  Button,
  ListIcon,
  Switch,
  useToast,
  Text,
  Flex,
} from '@chakra-ui/core'
import { useRouter } from 'next/router'
import { AiFillProject } from 'react-icons/ai'
import { Project } from '@prisma/client'

interface Props {
  isOpen: boolean
  onClose: () => void
  newProject: boolean
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  userProjectList: Project[]
  initProject: () => void
  loading: boolean
}

interface UpdateProject {
  id: number
  public: boolean
  projectName: string
}

const ModalComponent = (props: Props) => {
  const router = useRouter()
  const toast = useToast()

  const updateProject = async (e: UpdateProject) => {
    let bodyData = {
      project: {
        id: e.id,
        public: !e.public,
      },
    }
    console.log(bodyData)
    const response = await fetch('/api/project/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
    })
    if (e.public) {
      await fetch('/.netlify/functions/take-screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          pageToScreenshot: `${process.env.DEPLOY_URL}/project/preview/${e.id}-${e.projectName}`,
          id: e.id,
        }),
      })
    }
    const data = await response.json()
    return data
  }

  const publishPublicProject = async (e: UpdateProject) => {
    const data = {
      id: e.id,
      public: e.public,
      projectName: e.projectName,
    }

    const projectUpdated = await updateProject(data)

    if (projectUpdated) {
      toast({
        title: 'The project visibility has been updated',
        description: 'The project has been updated successfully',
        status: 'success',
        duration: 9000,
        isClosable: true,
      })
    } else {
      toast({
        title: 'Error when updated project',
        description: 'An error occured, try again later',
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
    }
  }

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent
        borderRadius="md"
        height={props.newProject ? 'unset' : '400px'}
      >
        <ModalHeader>
          {props.newProject ? 'Create new project' : 'Project list'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="scroll">
          {props.newProject ? (
            <FormControl isRequired>
              <FormLabel htmlFor="fname">Project name</FormLabel>
              <Input
                id="fname"
                placeholder="Project name"
                mt="0.5rem"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  props.handleChange(e)
                }
              />
            </FormControl>
          ) : props.loading ? (
            <Spinner m="0 auto" color="#319795" size="xl" mt="3rem" />
          ) : props.userProjectList.length > 0 ? (
            <List spacing={3}>
              {props.userProjectList.map((e: Project, i: number) => {
                return (
                  <>
                    <ListItem
                      textAlign="center"
                      backgroundColor="#2E3748"
                      color="white"
                      borderRadius={5}
                      p="0.5rem"
                      cursor="pointer"
                      _hover={{ backgroundColor: 'teal.400' }}
                      fontWeight={600}
                      fontSize="md"
                      mt={3}
                      key={i}
                    >
                      <Flex justify="center" align="center">
                        <Box
                          onClick={() => {
                            const href = `/project/${e.id}-${e.projectName}`
                            router.push(href, href, { shallow: true })
                          }}
                          w="80%"
                          display="inline-block"
                        >
                          <ListIcon icon={AiFillProject} color="white" />
                          {e.id} - {e.projectName}
                        </Box>
                        <FormLabel htmlFor="projectPublic">isPublic</FormLabel>
                        <Switch
                          color="teal"
                          id="projectPublic"
                          size="md"
                          defaultIsChecked={e.public}
                          onChange={() => publishPublicProject(e)}
                        />
                      </Flex>
                    </ListItem>
                  </>
                )
              })}
            </List>
          ) : (
            <Box textAlign="center">
              <Text m="0 auto">
                Project list is empty, save a project to display it here
              </Text>
            </Box>
          )}
        </ModalBody>

        {props.newProject ? (
          <ModalFooter>
            <Button
              variantColor="ghost"
              color="grey"
              mr={3}
              onClick={() => props.onClose()}
            >
              Close
            </Button>
            <Button variantColor="blue" onClick={() => props.initProject()}>
              Create
            </Button>
          </ModalFooter>
        ) : (
          <ModalFooter>
            <Button
              variantColor="white"
              color="grey"
              mr={3}
              onClick={() => props.onClose()}
            >
              Close
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  )
}

export default ModalComponent
